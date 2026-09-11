import { Request, Response } from 'express';
import prisma from '../config/prisma';

const formatFAQ = (f: any) => ({
  ...f,
  id: f.id,
  _id: String(f.id),
});

export const getFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { status: 'active' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: faqs.map(formatFAQ) });
  } catch (error: any) {
    console.error('getFAQs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const getAllFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: faqs.map(formatFAQ) });
  } catch (error: any) {
    console.error('getAllFAQs error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, displayOrder, status } = req.body;
    const faq = await prisma.fAQ.create({
      data: {
        question: String(question || '').trim(),
        answer: String(answer || '').trim(),
        displayOrder: parseInt(displayOrder || '0'),
        status: status === 'inactive' ? 'inactive' : 'active',
      },
    });
    res.status(201).json({ success: true, data: formatFAQ(faq) });
  } catch (error: any) {
    console.error('createFAQ error:', error);
    res.status(400).json({ success: false, message: 'Failed to create FAQ', error: error?.message || String(error) });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid FAQ ID' });
      return;
    }

    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'FAQ not found' });
      return;
    }

    const updateData: any = {};
    if (req.body.question !== undefined) updateData.question = String(req.body.question).trim();
    if (req.body.answer !== undefined) updateData.answer = String(req.body.answer).trim();
    if (req.body.displayOrder !== undefined) updateData.displayOrder = parseInt(req.body.displayOrder);
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';

    const faq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, data: formatFAQ(faq) });
  } catch (error: any) {
    console.error('updateFAQ error:', error);
    res.status(400).json({ success: false, message: 'Failed to update FAQ', error: error?.message || String(error) });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid FAQ ID' });
      return;
    }
    await prisma.fAQ.delete({ where: { id } });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    console.error('deleteFAQ error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
