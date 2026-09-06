import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { status: 'active' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const formatted = faqs.map((f) => ({ ...f, _id: f.id }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const formatted = faqs.map((f) => ({ ...f, _id: f.id }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, status, displayOrder } = req.body;
    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        status: status || 'active',
        displayOrder: Number(displayOrder) || 0,
      },
    });
    res.status(201).json({ success: true, data: { ...faq, _id: faq.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create FAQ', error });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataToUpdate: Record<string, unknown> = {};

    if (req.body.question !== undefined) dataToUpdate.question = req.body.question;
    if (req.body.answer !== undefined) dataToUpdate.answer = req.body.answer;
    if (req.body.status !== undefined) dataToUpdate.status = req.body.status;
    if (req.body.displayOrder !== undefined) dataToUpdate.displayOrder = Number(req.body.displayOrder);

    const faq = await prisma.fAQ.update({
      where: { id },
      data: dataToUpdate as any,
    });

    res.json({ success: true, data: { ...faq, _id: faq.id } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update FAQ', error });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.fAQ.delete({
      where: { id },
    });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
