import { Request, Response } from 'express';
import Appointment from '../models/Appointment';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, doctorId, serviceId, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (serviceId) filter.serviceId = serviceId;
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.appointmentDate = { $gte: d, $lt: next };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.json({ success: true, data: appointments, total, page: Number(page), limit: Number(limit) });
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
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });
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
