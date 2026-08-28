import { Request, Response } from 'express';
import Doctor from '../models/Doctor';

export const getDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllDoctors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.create({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create doctor', error });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update doctor', error });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
