import { Request, Response } from 'express';
import Service from '../models/Service';

const slugify = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, status: 'active' });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = slugify(req.body.name);
    const service = await Service.create({
      ...req.body,
      slug,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create service', error });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    if (req.body.name) updateData.slug = slugify(req.body.name);

    const service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update service', error });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
