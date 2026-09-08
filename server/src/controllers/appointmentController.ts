import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import { sendConfirmationEmail } from '../services/emailService';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, doctorName, serviceName, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') filter.status = status;
    if (doctorName && typeof doctorName === 'string') filter.doctorName = doctorName;
    if (serviceName && typeof serviceName === 'string') filter.serviceName = serviceName;
    if (date && typeof date === 'string') {
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const startDate = new Date(`${dateStr}T00:00:00.000Z`);
      const endDate = new Date(`${dateStr}T23:59:59.999Z`);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take),
      Appointment.countDocuments(filter),
    ]);

    res.json({ success: true, data: appointments, total, page: Number(page), limit: take });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAppointmentStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({ success: true, data: { total, pending, confirmed, completed, cancelled } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientName,
      phone,
      email,
      serviceName,
      doctorName,
      appointmentDate,
      appointmentTime,
      message,
      status,
      adminNote,
    } = req.body;

    if (!patientName || !phone || !email || !appointmentDate || !appointmentTime) {
      res.status(400).json({ success: false, message: 'All required fields must be provided' });
      return;
    }

    // Check conflict: slot already booked on the same date and time
    const dateStr = typeof appointmentDate === 'string' && appointmentDate.includes('T')
      ? appointmentDate.split('T')[0]
      : String(appointmentDate);
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    const existingBooking = await Appointment.findOne({
      appointmentDate: { $gte: startDate, $lte: endDate },
      appointmentTime: String(appointmentTime).trim(),
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
      return;
    }

    const appointment = await Appointment.create({
      patientName,
      phone,
      email,
      serviceName,
      doctorName,
      appointmentDate: startDate,
      appointmentTime: String(appointmentTime).trim(),
      message,
      status: status || 'pending',
      adminNote,
    });

    // Send confirmation email
    if (email) {
      sendConfirmationEmail({
        patientName,
        email,
        phone,
        serviceName,
        message,
      }).catch((err) => console.error('Error sending confirmation email:', err));
    }

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to book appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBookedSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ success: false, message: 'Date is required' });
      return;
    }

    const dateStr = date.includes('T') ? date.split('T')[0] : date;
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    const bookedAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: {
        $ne: 'cancelled',
      },
    }).select('appointmentTime');

    const bookedTimes = bookedAppointments.map((a) => a.appointmentTime).filter(Boolean);
    res.json({ success: true, bookedTimes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booked slots', error });
  }
};
