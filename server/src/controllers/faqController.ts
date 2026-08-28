import { Request, Response } from 'express';
import FAQ from '../models/FAQ';

export const getFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find({ status: 'active' }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllFAQs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create FAQ', error });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) {
      res.status(404).json({ success: false, message: 'FAQ not found' });
      return;
    }
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update FAQ', error });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      res.status(404).json({ success: false, message: 'FAQ not found' });
      return;
    }
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
