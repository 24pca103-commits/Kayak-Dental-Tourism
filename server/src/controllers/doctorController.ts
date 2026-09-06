import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    // Parse availability JSON string to array for frontend compatibility
    const formatted = doctors.map((doc) => ({
      ...doc,
      _id: doc.id,
      availability: typeof doc.availability === 'string' ? JSON.parse(doc.availability || '[]') : doc.availability,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const formatted = doctors.map((doc) => ({
      ...doc,
      _id: doc.id,
      availability: typeof doc.availability === 'string' ? JSON.parse(doc.availability || '[]') : doc.availability,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    const formatted = {
      ...doctor,
      _id: doctor.id,
      availability: typeof doctor.availability === 'string' ? JSON.parse(doctor.availability || '[]') : doctor.availability,
    };
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, qualification, specialization, experience, description, availability, status } = req.body;
    const availStr = Array.isArray(availability)
      ? JSON.stringify(availability)
      : typeof availability === 'string'
      ? availability
      : '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]';

    const doctor = await prisma.doctor.create({
      data: {
        name,
        qualification,
        specialization,
        experience: Number(experience) || 0,
        description: description || '',
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        availability: availStr,
        status: status || 'active',
      },
    });
    res.status(201).json({ success: true, data: { ...doctor, _id: doctor.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create doctor', error });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate: Record<string, unknown> = {};
    const allowed = ['name', 'qualification', 'specialization', 'experience', 'description', 'status'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        dataToUpdate[field] = field === 'experience' ? Number(req.body[field]) : req.body[field];
      }
    });

    if (req.body.availability !== undefined) {
      dataToUpdate.availability = Array.isArray(req.body.availability)
        ? JSON.stringify(req.body.availability)
        : req.body.availability;
    }

    if (req.file) {
      dataToUpdate.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      dataToUpdate.image = req.body.image;
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: dataToUpdate as any,
    });

    res.json({ success: true, data: { ...doctor, _id: doctor.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update doctor', error });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.doctor.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
