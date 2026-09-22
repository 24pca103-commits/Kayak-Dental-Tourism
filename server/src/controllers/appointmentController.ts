import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma, { isDbOnline } from '../config/prisma';
import { sendConfirmationEmail, sendStatusNotificationEmail } from '../services/emailService';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary';

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['rescheduled', 'confirmed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['pending'],
};

export interface AppointmentItem {
  _id: string;
  id?: number;
  patientName: string;
  phone: string;
  email: string;
  serviceId?: number | null;
  serviceName?: string;
  doctorId?: number | null;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  adminNote?: string;
  attachments?: string | null;
  createdAt: string;
  updatedAt: string;
}

const APPOINTMENTS_DATA_FILE = path.join(__dirname, '../../data/appointments.json');

const INITIAL_DEMO_APPOINTMENTS: AppointmentItem[] = [
  {
    _id: 'bk_demo_1',
    id: 101,
    patientName: 'Sarah Jenkins',
    phone: '+44 7911 123456',
    email: 'sarah.j@example.co.uk',
    serviceName: 'Dental Implants',
    doctorName: 'Dr. Anitha Rao',
    appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    appointmentTime: '10:00 AM',
    message: 'Travelling from London for full arch dental implant consultation.',
    status: 'pending',
    adminNote: '',
    attachments: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'bk_demo_2',
    id: 102,
    patientName: 'David Miller',
    phone: '+1 415 555 2671',
    email: 'david.miller@example.com',
    serviceName: 'Smile Designing',
    doctorName: 'Dr. Priya Sharma',
    appointmentDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    appointmentTime: '11:30 AM',
    message: 'Inquiring about veneers and complete smile makeover package.',
    status: 'confirmed',
    adminNote: 'Virtual consultation completed. Airport pickup requested.',
    attachments: null,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    _id: 'bk_demo_3',
    id: 103,
    patientName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.k@example.com',
    serviceName: 'Teeth Alignment',
    doctorName: 'Dr. Ramesh Kumar',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    appointmentTime: '4:00 PM',
    message: 'Need consultation for clear invisible aligners.',
    status: 'rescheduled',
    adminNote: 'Rescheduled on patient request from morning slot.',
    attachments: null,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

function loadAppointmentsFromDisk(): AppointmentItem[] {
  try {
    if (fs.existsSync(APPOINTMENTS_DATA_FILE)) {
      const raw = fs.readFileSync(APPOINTMENTS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(APPOINTMENTS_DATA_FILE), { recursive: true });
    fs.writeFileSync(APPOINTMENTS_DATA_FILE, JSON.stringify(INITIAL_DEMO_APPOINTMENTS, null, 2), 'utf-8');
    return INITIAL_DEMO_APPOINTMENTS;
  } catch (err) {
    console.error('Error reading appointments.json:', err);
    return INITIAL_DEMO_APPOINTMENTS;
  }
}

function saveAppointmentsToDisk(list: AppointmentItem[]) {
  try {
    fs.mkdirSync(path.dirname(APPOINTMENTS_DATA_FILE), { recursive: true });
    fs.writeFileSync(APPOINTMENTS_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing appointments.json:', err);
  }
}

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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit per file
});

export const uploadAppointmentFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    const host = req.get('host') || 'kayal-dental-tourism-treatment.onrender.com';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const uploaded = await Promise.all(
      files.map(async (f) => {
        let finalUrl = `${baseUrl}/uploads/${f.filename}`;

        if (isCloudinaryConfigured()) {
          try {
            const cldPromise = uploadToCloudinary(f.path, 'kayal_dental/patient_media');
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Cloudinary response timeout (fallback to local server disk)')), 12000)
            );
            const cldRes = await Promise.race([cldPromise, timeoutPromise]);
            if (cldRes?.url) {
              finalUrl = cldRes.url;
              console.log(`[Cloudinary] Successfully uploaded ${f.originalname} to: ${finalUrl}`);
            }
          } catch (cldErr: any) {
            console.warn(`[Cloudinary] Upload notice for ${f.originalname}:`, cldErr.message, '(Using local disk fallback)');
          }
        }

        return {
          name: f.originalname,
          filename: f.filename,
          url: finalUrl,
          size: f.size,
          type: f.mimetype,
        };
      })
    );

    res.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('uploadAppointmentFiles error:', error);
    res.status(500).json({ success: false, message: 'File upload failed', error });
  }
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  const { status, date, doctorName, serviceName, page = 1, limit = 100 } = req.query;
  const take = Number(limit) || 100;
  const skip = (Number(page) - 1) * take;

  const returnFromDisk = () => {
    let list = loadAppointmentsFromDisk();
    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter((a) => a.status === status);
    }
    if (doctorName && typeof doctorName === 'string') {
      list = list.filter((a) => a.doctorName?.toLowerCase().includes((doctorName as string).toLowerCase()));
    }
    if (serviceName && typeof serviceName === 'string') {
      list = list.filter((a) => a.serviceName?.toLowerCase().includes((serviceName as string).toLowerCase()));
    }
    if (date && typeof date === 'string') {
      const targetDateStr = date.includes('T') ? date.split('T')[0] : date;
      list = list.filter((a) => a.appointmentDate && a.appointmentDate.startsWith(targetDateStr));
    }
    const paged = list.slice(skip, skip + take);
    res.json({ success: true, data: paged, total: list.length, page: Number(page), limit: take });
  };

  if (!isDbOnline()) {
    return returnFromDisk();
  }

  try {
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

    const [dbAppointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.appointment.count({ where }),
    ]);

    const formattedData = dbAppointments.map((a) => ({
      ...a,
      _id: String(a.id),
      appointmentDate: a.appointmentDate instanceof Date ? a.appointmentDate.toISOString() : String(a.appointmentDate),
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
      updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt),
    }));

    // Merge with any disk appointments
    const diskAppointments = loadAppointmentsFromDisk();
    const dbIds = new Set(formattedData.map((a) => a._id));
    const merged = [
      ...formattedData,
      ...diskAppointments.filter((d) => !dbIds.has(d._id) && !dbIds.has(String(d.id))),
    ];

    res.json({ success: true, data: merged, total: merged.length, page: Number(page), limit: take });
  } catch (error: any) {
    returnFromDisk();
  }
};

export const getAppointmentStats = async (_req: Request, res: Response): Promise<void> => {
  const returnStatsFromDisk = () => {
    const list = loadAppointmentsFromDisk();
    const total = list.length;
    const pending = list.filter((a) => a.status === 'pending').length;
    const confirmed = list.filter((a) => a.status === 'confirmed').length;
    const completed = list.filter((a) => a.status === 'completed').length;
    const cancelled = list.filter((a) => a.status === 'cancelled').length;
    res.json({ success: true, data: { total, pending, confirmed, completed, cancelled } });
  };

  if (!isDbOnline()) {
    return returnStatsFromDisk();
  }

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
    returnStatsFromDisk();
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

    const uniqueNumericId = Date.now();
    const newAppointment: AppointmentItem = {
      _id: 'bk_' + uniqueNumericId,
      id: uniqueNumericId,
      patientName: String(patientName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      serviceName: serviceName ? String(serviceName).trim() : 'General Dental Consultation',
      doctorName: doctorName ? String(doctorName).trim() : 'Any Available Doctor',
      appointmentDate: appointmentDateObj.toISOString(),
      appointmentTime: appointmentTime ? String(appointmentTime).trim() : '10:00 AM',
      message: message ? String(message).trim() : '',
      status: (status as any) || 'pending',
      adminNote: adminNote ? String(adminNote).trim() : '',
      attachments: attachmentsStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately persist to disk storage
    const currentList = loadAppointmentsFromDisk();
    saveAppointmentsToDisk([newAppointment, ...currentList]);
    console.log(`[Appointment] Successfully saved booking for ${newAppointment.patientName} (${newAppointment.serviceName}) to disk storage`);

    // 2. Also try Prisma database in background if available
    if (isDbOnline()) {
      try {
        const dbAppointment = await prisma.appointment.create({
          data: {
            patientName: newAppointment.patientName,
            phone: newAppointment.phone,
            email: newAppointment.email,
            serviceName: newAppointment.serviceName,
            doctorName: newAppointment.doctorName,
            appointmentDate: appointmentDateObj,
            appointmentTime: newAppointment.appointmentTime,
            message: newAppointment.message,
            status: (newAppointment.status as any) || 'pending',
            adminNote: newAppointment.adminNote,
            attachments: attachmentsStr,
          },
        });
        newAppointment.id = dbAppointment.id;
      } catch (dbErr: any) {
        console.warn('[Appointment] MySQL unavailable, saved safely to disk storage:', dbErr?.message || dbErr);
      }
    }

    // 3. Send confirmation email asynchronously if configured
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
      data: newAppointment,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to book appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const numId = parseInt(rawId);

    const list = loadAppointmentsFromDisk();
    const index = list.findIndex(
      (a) => a._id === rawId || String(a.id) === rawId || (!isNaN(numId) && a.id === numId)
    );

    const existing = index !== -1 ? list[index] : null;

    const { status, adminNote, attachments, appointmentDate, appointmentTime } = req.body;
    const updateData: any = {};

    if (existing) {
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
      if (appointmentDate !== undefined) updateData.appointmentDate = new Date(appointmentDate).toISOString();
      if (appointmentTime !== undefined) updateData.appointmentTime = appointmentTime;
      if (adminNote !== undefined) updateData.adminNote = adminNote;
      if (attachments !== undefined) {
        updateData.attachments = typeof attachments === 'object' ? JSON.stringify(attachments) : String(attachments);
      }
      updateData.updatedAt = new Date().toISOString();

      const updated = { ...existing, ...updateData };
      list[index] = updated;
      saveAppointmentsToDisk(list);

      // Try Prisma if DB is available
      if (!isNaN(numId)) {
        try {
          await prisma.appointment.update({
            where: { id: numId },
            data: {
              ...(updateData.status ? { status: updateData.status } : {}),
              ...(updateData.appointmentDate ? { appointmentDate: new Date(updateData.appointmentDate) } : {}),
              ...(updateData.appointmentTime ? { appointmentTime: updateData.appointmentTime } : {}),
              ...(updateData.adminNote !== undefined ? { adminNote: updateData.adminNote } : {}),
              ...(updateData.attachments !== undefined ? { attachments: updateData.attachments } : {}),
            },
          });
        } catch {
          // ignore DB offline
        }
      }

      // Send status notification email to user if status changed or date rescheduled
      if (((status && status !== existing.status) || appointmentDate || appointmentTime) && existing.email) {
        sendStatusNotificationEmail({
          patientName: existing.patientName,
          email: existing.email,
          phone: existing.phone,
          serviceName: existing.serviceName || undefined,
          doctorName: existing.doctorName || undefined,
          appointmentDate: updateData.appointmentDate ? new Date(updateData.appointmentDate) : new Date(existing.appointmentDate),
          appointmentTime: updateData.appointmentTime || existing.appointmentTime,
          status: status || existing.status,
          previousStatus: existing.status,
          adminNote: adminNote || existing.adminNote || undefined,
        }).catch((err) => console.error('Error sending status notification email:', err));
      }

      res.json({
        success: true,
        data: updated,
        message: `Status successfully updated to "${status || updated.status}" and notification sent.`,
      });
      return;
    }

    res.status(404).json({ success: false, message: 'Appointment not found' });
  } catch (error) {
    console.error('updateAppointment error:', error);
    res.status(400).json({ success: false, message: 'Failed to update appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const numId = parseInt(rawId);

    const list = loadAppointmentsFromDisk();
    const updated = list.filter(
      (a) => a._id !== rawId && String(a.id) !== rawId && (!isNaN(numId) ? a.id !== numId : true)
    );
    saveAppointmentsToDisk(updated);

    if (!isNaN(numId)) {
      try {
        await prisma.appointment.delete({ where: { id: numId } });
      } catch {
        // ignore DB offline
      }
    }

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

    if (isDbOnline()) {
      try {
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
        return;
      } catch {
        // Fallback to disk storage
      }
    }

    const list = loadAppointmentsFromDisk();
    const bookedTimes = list
      .filter((a) => a.appointmentDate && a.appointmentDate.startsWith(dateStr) && a.status !== 'cancelled')
      .map((a) => a.appointmentTime)
      .filter(Boolean);

    res.json({ success: true, bookedTimes });
  } catch (error) {
    console.error('getBookedSlots error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booked slots', error });
  }
};
