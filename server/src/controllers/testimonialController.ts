import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    const formatted = testimonials.map((t) => ({ ...t, _id: t.id }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const formatted = testimonials.map((t) => ({ ...t, _id: t.id }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientName, review, rating, status } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        patientName,
        review,
        rating: Number(rating) || 5,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        status: status || 'active',
      },
    });
    res.status(201).json({ success: true, data: { ...testimonial, _id: testimonial.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create testimonial', error });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate: Record<string, unknown> = {};

    if (req.body.patientName !== undefined) dataToUpdate.patientName = req.body.patientName;
    if (req.body.review !== undefined) dataToUpdate.review = req.body.review;
    if (req.body.rating !== undefined) dataToUpdate.rating = Number(req.body.rating);
    if (req.body.status !== undefined) dataToUpdate.status = req.body.status;

    if (req.file) {
      dataToUpdate.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      dataToUpdate.image = req.body.image;
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: dataToUpdate as any,
    });

    res.json({ success: true, data: { ...testimonial, _id: testimonial.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update testimonial', error });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.testimonial.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
