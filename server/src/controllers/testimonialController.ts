import { Request, Response } from 'express';
import prisma from '../config/prisma';

const formatTestimonial = (t: any) => ({
  ...t,
  id: t.id,
  _id: String(t.id),
});

export const getTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials.map(formatTestimonial) });
  } catch (error: any) {
    console.error('getTestimonials error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const getAllTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials.map(formatTestimonial) });
  } catch (error: any) {
    console.error('getAllTestimonials error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientName, review, rating, status } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        patientName: String(patientName || '').trim(),
        review: String(review || '').trim(),
        rating: parseInt(rating || '5'),
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        status: status === 'inactive' ? 'inactive' : 'active',
      },
    });
    res.status(201).json({ success: true, data: formatTestimonial(testimonial) });
  } catch (error: any) {
    console.error('createTestimonial error:', error);
    res.status(400).json({ success: false, message: 'Failed to create testimonial', error: error?.message || String(error) });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid testimonial ID' });
      return;
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }

    const updateData: any = {};
    if (req.body.patientName !== undefined) updateData.patientName = String(req.body.patientName).trim();
    if (req.body.review !== undefined) updateData.review = String(req.body.review).trim();
    if (req.body.rating !== undefined) updateData.rating = parseInt(req.body.rating);
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, data: formatTestimonial(testimonial) });
  } catch (error: any) {
    console.error('updateTestimonial error:', error);
    res.status(400).json({ success: false, message: 'Failed to update testimonial', error: error?.message || String(error) });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid testimonial ID' });
      return;
    }
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    console.error('deleteTestimonial error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
