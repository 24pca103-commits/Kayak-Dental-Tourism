import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma, { isDbOnline } from '../config/prisma';

const TESTIMONIALS_DATA_FILE = path.join(__dirname, '../../data/testimonials.json');

const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    _id: '1',
    patientName: 'Kavitha Sundaram',
    review: 'Dr. Priya and the entire KAYAL Dental team made my smile designing experience truly wonderful. The results exceeded all my expectations. Highly recommended!',
    rating: 5,
    image: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    _id: '2',
    patientName: 'Rajesh Venkat',
    review: 'Got my dental implants done here. Absolutely pain-free procedure with state-of-the-art facilities. The doctors explain every step clearly. Very happy with the outcome.',
    rating: 5,
    image: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    _id: '3',
    patientName: 'Meenakshi Krishnan',
    review: 'My son was terrified of dentists until we visited KAYAL. Dr. Karthik is amazing with kids! Now my son actually looks forward to dental check-ups.',
    rating: 5,
    image: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    _id: '4',
    patientName: 'Suresh Babu',
    review: 'Excellent orthodontic treatment with clear aligners. My teeth are perfectly aligned now in just 14 months. Transparent pricing and no hidden costs.',
    rating: 5,
    image: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

function loadTestimonialsFromDisk(): any[] {
  try {
    if (fs.existsSync(TESTIMONIALS_DATA_FILE)) {
      const raw = fs.readFileSync(TESTIMONIALS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(TESTIMONIALS_DATA_FILE), { recursive: true });
    fs.writeFileSync(TESTIMONIALS_DATA_FILE, JSON.stringify(INITIAL_TESTIMONIALS, null, 2), 'utf-8');
    return INITIAL_TESTIMONIALS;
  } catch (err) {
    console.error('Error reading testimonials.json:', err);
    return INITIAL_TESTIMONIALS;
  }
}

function saveTestimonialsToDisk(list: any[]) {
  try {
    fs.mkdirSync(path.dirname(TESTIMONIALS_DATA_FILE), { recursive: true });
    fs.writeFileSync(TESTIMONIALS_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing testimonials.json:', err);
  }
}

const formatTestimonial = (t: any) => ({
  ...t,
  id: t.id,
  _id: String(t.id),
});

export const getTestimonials = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadTestimonialsFromDisk().filter((t) => t.status === 'active');
    res.json({ success: true, data: list.map(formatTestimonial) });
    return;
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials.map(formatTestimonial) });
  } catch (error: any) {
    const list = loadTestimonialsFromDisk().filter((t) => t.status === 'active');
    res.json({ success: true, data: list.map(formatTestimonial) });
  }
};

export const getAllTestimonials = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadTestimonialsFromDisk();
    res.json({ success: true, data: list.map(formatTestimonial) });
    return;
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: testimonials.map(formatTestimonial) });
  } catch (error: any) {
    const list = loadTestimonialsFromDisk();
    res.json({ success: true, data: list.map(formatTestimonial) });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientName, review, rating, status } = req.body;
    const newId = Date.now();
    const newTestimonial = {
      id: newId,
      _id: String(newId),
      patientName: String(patientName || '').trim(),
      review: String(review || '').trim(),
      rating: parseInt(rating || '5'),
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
    };

    const list = loadTestimonialsFromDisk();
    saveTestimonialsToDisk([newTestimonial, ...list]);

    if (isDbOnline()) {
      try {
        const dbTestimonial = await prisma.testimonial.create({
          data: {
            patientName: newTestimonial.patientName,
            review: newTestimonial.review,
            rating: newTestimonial.rating,
            image: newTestimonial.image,
            status: newTestimonial.status as any,
          },
        });
        newTestimonial.id = dbTestimonial.id;
        newTestimonial._id = String(dbTestimonial.id);
      } catch {
        // ignore DB offline
      }
    }

    res.status(201).json({ success: true, data: formatTestimonial(newTestimonial) });
  } catch (error: any) {
    console.error('createTestimonial error:', error);
    res.status(400).json({ success: false, message: 'Failed to create testimonial', error: error?.message || String(error) });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadTestimonialsFromDisk();
    const index = list.findIndex((t) => t._id === rawId || t.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Testimonial not found' });
      return;
    }

    const existing = list[index];
    const updateData: any = {};
    if (req.body.patientName !== undefined) updateData.patientName = String(req.body.patientName).trim();
    if (req.body.review !== undefined) updateData.review = String(req.body.review).trim();
    if (req.body.rating !== undefined) updateData.rating = parseInt(req.body.rating);
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    const updated = { ...existing, ...updateData };
    list[index] = updated;
    saveTestimonialsToDisk(list);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.testimonial.update({
          where: { id },
          data: updateData,
        });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, data: formatTestimonial(updated) });
  } catch (error: any) {
    console.error('updateTestimonial error:', error);
    res.status(400).json({ success: false, message: 'Failed to update testimonial', error: error?.message || String(error) });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadTestimonialsFromDisk();
    const updated = list.filter((t) => t._id !== rawId && t.id !== id);
    saveTestimonialsToDisk(updated);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.testimonial.delete({ where: { id } });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    console.error('deleteTestimonial error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
