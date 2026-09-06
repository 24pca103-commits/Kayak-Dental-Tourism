import { Request, Response } from 'express';
import prisma from '../config/prisma';

const slugify = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    const formatted = services.map((s) => ({
      ...s,
      _id: s.id,
      benefits: typeof s.benefits === 'string' ? JSON.parse(s.benefits || '[]') : s.benefits,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const formatted = services.map((s) => ({
      ...s,
      _id: s.id,
      benefits: typeof s.benefits === 'string' ? JSON.parse(s.benefits || '[]') : s.benefits,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug },
    });
    if (!service || service.status !== 'active') {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    const formatted = {
      ...service,
      _id: service.id,
      benefits: typeof service.benefits === 'string' ? JSON.parse(service.benefits || '[]') : service.benefits,
    };
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, shortDescription, description, benefits, treatmentProcess, whoNeeds, duration, status } = req.body;
    const slug = slugify(name);
    const benefitsStr = Array.isArray(benefits) ? JSON.stringify(benefits) : typeof benefits === 'string' ? benefits : '[]';

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        shortDescription: shortDescription || '',
        description: description || '',
        benefits: benefitsStr,
        treatmentProcess: treatmentProcess || '',
        whoNeeds: whoNeeds || '',
        duration: duration || '',
        status: status || 'active',
      },
    });
    res.status(201).json({ success: true, data: { ...service, _id: service.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create service', error });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate: Record<string, unknown> = {};
    const allowed = ['name', 'shortDescription', 'description', 'treatmentProcess', 'whoNeeds', 'duration', 'status'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) dataToUpdate[field] = req.body[field];
    });

    if (req.body.name) {
      dataToUpdate.slug = slugify(req.body.name);
    }

    if (req.body.benefits !== undefined) {
      dataToUpdate.benefits = Array.isArray(req.body.benefits) ? JSON.stringify(req.body.benefits) : req.body.benefits;
    }

    if (req.file) {
      dataToUpdate.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      dataToUpdate.image = req.body.image;
    }

    const service = await prisma.service.update({
      where: { id },
      data: dataToUpdate as any,
    });

    res.json({ success: true, data: { ...service, _id: service.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update service', error });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.service.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
