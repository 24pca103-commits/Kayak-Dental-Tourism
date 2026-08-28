import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';

export const getTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.create({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create testimonial', error });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!testimonial) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update testimonial', error });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
