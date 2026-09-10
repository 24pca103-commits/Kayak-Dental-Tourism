import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import { sendConfirmationEmail, sendStatusNotificationEmail } from '../services/emailService';

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['rescheduled', 'confirmed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['pending'],
};

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

export const uploadAppointmentFiles = (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    const uploaded = files.map((f) => ({
      name: f.originalname,
      filename: f.filename,
      url: `/uploads/${f.filename}`,
      size: f.size,
      type: f.mimetype,
    }));

    res.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('uploadAppointmentFiles error:', error);
    res.status(500).json({ success: false, message: 'File upload failed', error });
  }
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, doctorName, serviceName, page = 1, limit = 100 } = req.query;
    const where: any = {};

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }
    if (doctorName && typeof doctorName === 'string') {
      where.doctorName = { contains: doctorName };
    }
    if (serviceName && typeof serviceName === 'string') {
      where.serviceName = { contains: serviceName };
    }
    if (date && typeof date === 'string') {
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const startDate = new Date(`${dateStr}T00:00:00.000Z`);
      const endDate = new Date(`${dateStr}T23:59:59.999Z`);
      where.appointmentDate = { gte: startDate, lte: endDate };
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.appointment.count({ where }),
    ]);

    const formattedData = appointments.map((a) => ({
      ...a,
      _id: String(a.id),
    }));

    res.json({ success: true, data: formattedData, total, page: Number(page), limit: take });
  } catch (error: any) {
    console.error('getAppointments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
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
  } catch (error: any) {
    console.error('getAppointmentStats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
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
      attachments,
    } = req.body;

    if (!patientName || !phone || !email) {
      res.status(400).json({ success: false, message: 'Patient name, phone, and email are required' });
      return;
    }

    // Process date
    let appointmentDateObj = new Date();
    if (appointmentDate) {
      const dateStr = typeof appointmentDate === 'string' && appointmentDate.includes('T')
        ? appointmentDate.split('T')[0]
        : String(appointmentDate);
      appointmentDateObj = new Date(`${dateStr}T00:00:00.000Z`);
    }

    let attachmentsStr: string | null = null;
    if (attachments) {
      attachmentsStr = typeof attachments === 'object' ? JSON.stringify(attachments) : String(attachments);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName: String(patientName).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        serviceName: serviceName ? String(serviceName).trim() : 'General Dental Consultation',
        doctorName: doctorName ? String(doctorName).trim() : 'Any Available Doctor',
        appointmentDate: appointmentDateObj,
        appointmentTime: appointmentTime ? String(appointmentTime).trim() : '10:00 AM',
        message: message ? String(message).trim() : '',
        status: (status as any) || 'pending',
        adminNote: adminNote ? String(adminNote).trim() : '',
        attachments: attachmentsStr,
      },
    });

    // Send confirmation email asynchronously if configured
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
      data: {
        ...appointment,
        _id: String(appointment.id),
      },
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(400).json({ success: false, message: 'Failed to book appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid ID' });
      return;
    }

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const { status, adminNote, attachments, appointmentDate, appointmentTime } = req.body;
    const updateData: any = {};

    // Enforce sequential status order
    if (status && status !== existing.status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status order. Cannot jump from "${existing.status}" directly to "${status}". Allowed next steps: ${allowed.join(', ')}`,
        });
        return;
      }
      updateData.status = status;
    }

    if (appointmentDate !== undefined) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime !== undefined) updateData.appointmentTime = appointmentTime;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (attachments !== undefined) {
      updateData.attachments = typeof attachments === 'object' ? JSON.stringify(attachments) : String(attachments);
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    // Send status notification email to user if status changed or date rescheduled
    if (((status && status !== existing.status) || appointmentDate || appointmentTime) && existing.email) {
      sendStatusNotificationEmail({
        patientName: existing.patientName,
        email: existing.email,
        phone: existing.phone,
        serviceName: existing.serviceName || undefined,
        doctorName: existing.doctorName || undefined,
        appointmentDate: updateData.appointmentDate || existing.appointmentDate,
        appointmentTime: updateData.appointmentTime || existing.appointmentTime,
        status: status || existing.status,
        previousStatus: existing.status,
        adminNote: adminNote || existing.adminNote || undefined,
      }).catch((err) => console.error('Error sending status notification email:', err));
    }

    res.json({
      success: true,
      data: {
        ...appointment,
        _id: String(appointment.id),
      },
      message: `Status successfully updated to "${status || appointment.status}" and notification sent.`,
    });
  } catch (error) {
    console.error('updateAppointment error:', error);
    res.status(400).json({ success: false, message: 'Failed to update appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid ID' });
      return;
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('deleteAppointment error:', error);
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

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: startDate, lte: endDate },
        status: { not: 'cancelled' },
      },
      select: { appointmentTime: true },
    });

    const bookedTimes = bookedAppointments.map((a) => a.appointmentTime).filter(Boolean);
    res.json({ success: true, bookedTimes });
  } catch (error) {
    console.error('getBookedSlots error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booked slots', error });
  }
};
