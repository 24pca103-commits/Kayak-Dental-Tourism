import { Request, Response } from 'express';
import prisma from '../config/prisma';

const formatDoctor = (d: any) => {
  let availability = d.availability;
  if (typeof availability === 'string') {
    try {
      availability = JSON.parse(availability);
    } catch {
      availability = [availability];
    }
  }
  return {
    ...d,
    id: d.id,
    _id: String(d.id),
    availability,
  };
};

export const getDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: doctors.map(formatDoctor) });
  } catch (error: any) {
    console.error('getDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const getAllDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: doctors.map(formatDoctor) });
  } catch (error: any) {
    console.error('getAllDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid doctor ID' });
      return;
    }
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: formatDoctor(doctor) });
  } catch (error: any) {
    console.error('getDoctorById error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, qualification, specialization, experience, description, availability, status } = req.body;
    let availabilityStr = availability;
    if (Array.isArray(availability)) {
      availabilityStr = JSON.stringify(availability);
    } else if (typeof availability === 'string') {
      try {
        JSON.parse(availability);
        availabilityStr = availability;
      } catch {
        availabilityStr = JSON.stringify([availability]);
      }
    } else {
      availabilityStr = JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    }

    const doctor = await prisma.doctor.create({
      data: {
        name: String(name || '').trim(),
        qualification: String(qualification || '').trim(),
        specialization: String(specialization || '').trim(),
        experience: parseInt(experience || '0'),
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        description: String(description || '').trim(),
        availability: availabilityStr,
        status: status === 'inactive' ? 'inactive' : 'active',
      },
    });
    res.status(201).json({ success: true, data: formatDoctor(doctor) });
  } catch (error: any) {
    console.error('createDoctor error:', error);
    res.status(400).json({ success: false, message: 'Failed to create doctor', error: error?.message || String(error) });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid doctor ID' });
      return;
    }

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.qualification !== undefined) updateData.qualification = String(req.body.qualification).trim();
    if (req.body.specialization !== undefined) updateData.specialization = String(req.body.specialization).trim();
    if (req.body.experience !== undefined) updateData.experience = parseInt(req.body.experience);
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    if (req.body.availability !== undefined) {
      if (Array.isArray(req.body.availability)) {
        updateData.availability = JSON.stringify(req.body.availability);
      } else if (typeof req.body.availability === 'string') {
        try {
          JSON.parse(req.body.availability);
          updateData.availability = req.body.availability;
        } catch {
          updateData.availability = JSON.stringify([req.body.availability]);
        }
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, data: formatDoctor(doctor) });
  } catch (error: any) {
    console.error('updateDoctor error:', error);
    res.status(400).json({ success: false, message: 'Failed to update doctor', error: error?.message || String(error) });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid doctor ID' });
      return;
    }
    await prisma.doctor.delete({ where: { id } });
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error: any) {
    console.error('deleteDoctor error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
