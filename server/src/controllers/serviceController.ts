import { Request, Response } from 'express';
import prisma from '../config/prisma';

const slugify = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const formatService = (s: any) => {
  let benefits = s.benefits;
  if (typeof benefits === 'string') {
    try {
      benefits = JSON.parse(benefits);
    } catch {
      benefits = benefits ? [benefits] : [];
    }
  }
  return {
    ...s,
    id: s.id,
    _id: String(s.id),
    benefits: Array.isArray(benefits) ? benefits : [],
  };
};

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: services.map(formatService) });
  } catch (error: any) {
    console.error('getServices error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: services.map(formatService) });
  } catch (error: any) {
    console.error('getAllServices error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
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
    res.json({ success: true, data: formatService(service) });
  } catch (error: any) {
    console.error('getServiceBySlug error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, shortDescription, description, duration, status, treatmentProcess, whoNeeds } = req.body;
    const slug = req.body.slug || slugify(name || '');

    let benefitsStr = req.body.benefits;
    if (Array.isArray(benefitsStr)) {
      benefitsStr = JSON.stringify(benefitsStr);
    } else if (typeof benefitsStr === 'string') {
      try {
        JSON.parse(benefitsStr);
      } catch {
        benefitsStr = JSON.stringify([benefitsStr]);
      }
    } else {
      benefitsStr = JSON.stringify([]);
    }

    const service = await prisma.service.create({
      data: {
        name: String(name || '').trim(),
        slug,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
        shortDescription: String(shortDescription || '').trim(),
        description: String(description || '').trim(),
        benefits: benefitsStr,
        treatmentProcess: treatmentProcess ? String(treatmentProcess).trim() : null,
        whoNeeds: whoNeeds ? String(whoNeeds).trim() : null,
        duration: duration ? String(duration).trim() : '',
        status: status === 'inactive' ? 'inactive' : 'active',
      },
    });
    res.status(201).json({ success: true, data: formatService(service) });
  } catch (error: any) {
    console.error('createService error:', error);
    res.status(400).json({ success: false, message: 'Failed to create service', error: error?.message || String(error) });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid service ID' });
      return;
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const updateData: any = {};
    if (req.body.name !== undefined) {
      updateData.name = String(req.body.name).trim();
      if (!req.body.slug) updateData.slug = slugify(req.body.name);
    }
    if (req.body.slug !== undefined) updateData.slug = slugify(req.body.slug);
    if (req.body.shortDescription !== undefined) updateData.shortDescription = String(req.body.shortDescription).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.duration !== undefined) updateData.duration = String(req.body.duration).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.treatmentProcess !== undefined) updateData.treatmentProcess = req.body.treatmentProcess ? String(req.body.treatmentProcess).trim() : null;
    if (req.body.whoNeeds !== undefined) updateData.whoNeeds = req.body.whoNeeds ? String(req.body.whoNeeds).trim() : null;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    if (req.body.benefits !== undefined) {
      if (Array.isArray(req.body.benefits)) {
        updateData.benefits = JSON.stringify(req.body.benefits);
      } else if (typeof req.body.benefits === 'string') {
        try {
          JSON.parse(req.body.benefits);
          updateData.benefits = req.body.benefits;
        } catch {
          updateData.benefits = JSON.stringify([req.body.benefits]);
        }
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, data: formatService(service) });
  } catch (error: any) {
    console.error('updateService error:', error);
    res.status(400).json({ success: false, message: 'Failed to update service', error: error?.message || String(error) });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid service ID' });
      return;
    }
    await prisma.service.delete({ where: { id } });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error: any) {
    console.error('deleteService error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
