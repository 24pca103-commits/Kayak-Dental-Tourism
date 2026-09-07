import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendConfirmationEmail } from '../services/emailService';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, doctorId, serviceId, page = 1, limit = 20 } = req.query;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (doctorId) where.doctorId = Number(doctorId);
    if (serviceId) where.serviceId = Number(serviceId);
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.appointmentDate = { gte: d, lt: next };
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.appointment.count({ where: where as any }),
    ]);

    const formatted = appointments.map((a) => ({ ...a, _id: a.id }));

    res.json({ success: true, data: formatted, total, page: Number(page), limit: take });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAppointmentStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'pending' } }),
      prisma.appointment.count({ where: { status: 'confirmed' } }),
      prisma.appointment.count({ where: { status: 'completed' } }),
      prisma.appointment.count({ where: { status: 'cancelled' } }),
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
      serviceId,
      serviceName,
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
      message,
      status,
      adminNote,
    } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        phone,
        email,
        serviceId: serviceId ? Number(serviceId) : null,
        serviceName: serviceName || null,
        doctorId: doctorId ? Number(doctorId) : null,
        doctorName: doctorName || null,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        message: message || null,
        status: status || 'pending',
        adminNote: adminNote || null,
      },
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
      data: { ...appointment, _id: appointment.id },
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to book appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate: Record<string, unknown> = { ...req.body };

    if (dataToUpdate.serviceId) dataToUpdate.serviceId = Number(dataToUpdate.serviceId);
    if (dataToUpdate.doctorId) dataToUpdate.doctorId = Number(dataToUpdate.doctorId);
    if (dataToUpdate.appointmentDate) dataToUpdate.appointmentDate = new Date(dataToUpdate.appointmentDate as string);
    delete dataToUpdate._id;
    delete dataToUpdate.id;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate as any,
    });

    res.json({ success: true, data: { ...appointment, _id: appointment.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.appointment.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBookedSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required' });
      return;
    }

    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          notIn: ['cancelled'],
        },
      } as any,
      select: {
        appointmentTime: true,
      },
    });

    const bookedTimes = bookedAppointments.map((a) => a.appointmentTime).filter(Boolean);
    res.json({ success: true, bookedTimes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booked slots', error });
  }
};

