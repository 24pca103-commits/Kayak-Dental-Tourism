import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma, { isDbOnline } from '../config/prisma';

const FAQS_DATA_FILE = path.join(__dirname, '../../data/faqs.json');

const INITIAL_FAQS = [
  {
    id: 1,
    _id: '1',
    question: 'How often should I visit the dentist?',
    answer: 'We recommend a dental check-up every 6 months to maintain healthy teeth and gums. Regular visits help detect problems early and prevent costly treatments.',
    displayOrder: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    _id: '2',
    question: 'Do dental treatments cause pain?',
    answer: 'Most treatments are performed using modern techniques and appropriate anesthesia to ensure patient comfort. At KAYAL, we prioritize pain-free dentistry in a calm, reassuring environment.',
    displayOrder: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    _id: '3',
    question: 'Do you offer braces and clear aligners?',
    answer: 'Yes. We provide comprehensive orthodontic solutions including traditional metal braces, ceramic braces, and clear aligners based on individual patient requirements and lifestyle preferences.',
    displayOrder: 3,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    _id: '4',
    question: 'How long does a dental implant procedure take?',
    answer: 'The full dental implant process typically takes 3–6 months. This includes the implant placement, healing period (osseointegration), and crown fitting. The dentist will provide a personalized timeline after examination.',
    displayOrder: 4,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    _id: '5',
    question: 'Is teeth whitening safe?',
    answer: 'Professional teeth whitening performed under dental supervision is safe and effective for most patients. Our dental team assesses your suitability before treatment and uses only medical-grade whitening products.',
    displayOrder: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    _id: '6',
    question: 'Do you provide emergency dental care?',
    answer: 'Yes. We provide emergency dental care for urgent dental problems such as severe toothache, broken teeth, or dental trauma. Contact our clinic immediately and we will prioritize your appointment.',
    displayOrder: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    _id: '7',
    question: 'What age should my child first visit the dentist?',
    answer: 'We recommend bringing your child for their first dental visit when their first tooth appears, or by their first birthday. Early visits help establish healthy habits and prevent future problems.',
    displayOrder: 7,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    _id: '8',
    question: 'How do I take care of dental implants?',
    answer: 'Dental implants require the same care as natural teeth — brushing twice daily, flossing, and regular dental check-ups. With proper care, implants can last a lifetime.',
    displayOrder: 8,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

function loadFAQsFromDisk(): any[] {
  try {
    if (fs.existsSync(FAQS_DATA_FILE)) {
      const raw = fs.readFileSync(FAQS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(FAQS_DATA_FILE), { recursive: true });
    fs.writeFileSync(FAQS_DATA_FILE, JSON.stringify(INITIAL_FAQS, null, 2), 'utf-8');
    return INITIAL_FAQS;
  } catch (err) {
    console.error('Error reading faqs.json:', err);
    return INITIAL_FAQS;
  }
}

function saveFAQsToDisk(list: any[]) {
  try {
    fs.mkdirSync(path.dirname(FAQS_DATA_FILE), { recursive: true });
    fs.writeFileSync(FAQS_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing faqs.json:', err);
  }
}

const formatFAQ = (f: any) => ({
  ...f,
  id: f.id,
  _id: String(f.id),
});

export const getFAQs = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadFAQsFromDisk()
      .filter((f) => f.status === 'active')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json({ success: true, data: list.map(formatFAQ) });
    return;
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      where: { status: 'active' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: faqs.map(formatFAQ) });
  } catch (error: any) {
    const list = loadFAQsFromDisk()
      .filter((f) => f.status === 'active')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json({ success: true, data: list.map(formatFAQ) });
  }
};

export const getAllFAQs = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadFAQsFromDisk().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json({ success: true, data: list.map(formatFAQ) });
    return;
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: faqs.map(formatFAQ) });
  } catch (error: any) {
    const list = loadFAQsFromDisk().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json({ success: true, data: list.map(formatFAQ) });
  }
};

export const createFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, displayOrder, status } = req.body;
    const newId = Date.now();
    const newFAQ = {
      id: newId,
      _id: String(newId),
      question: String(question || '').trim(),
      answer: String(answer || '').trim(),
      displayOrder: parseInt(displayOrder || '0'),
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
    };

    const list = loadFAQsFromDisk();
    saveFAQsToDisk([newFAQ, ...list]);

    if (isDbOnline()) {
      try {
        const dbFAQ = await prisma.fAQ.create({
          data: {
            question: newFAQ.question,
            answer: newFAQ.answer,
            displayOrder: newFAQ.displayOrder,
            status: newFAQ.status as any,
          },
        });
        newFAQ.id = dbFAQ.id;
        newFAQ._id = String(dbFAQ.id);
      } catch {
        // ignore DB offline
      }
    }

    res.status(201).json({ success: true, data: formatFAQ(newFAQ) });
  } catch (error: any) {
    console.error('createFAQ error:', error);
    res.status(400).json({ success: false, message: 'Failed to create FAQ', error: error?.message || String(error) });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadFAQsFromDisk();
    const index = list.findIndex((f) => f._id === rawId || f.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'FAQ not found' });
      return;
    }

    const existing = list[index];
    const updateData: any = {};
    if (req.body.question !== undefined) updateData.question = String(req.body.question).trim();
    if (req.body.answer !== undefined) updateData.answer = String(req.body.answer).trim();
    if (req.body.displayOrder !== undefined) updateData.displayOrder = parseInt(req.body.displayOrder);
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';

    const updated = { ...existing, ...updateData };
    list[index] = updated;
    saveFAQsToDisk(list);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.fAQ.update({
          where: { id },
          data: updateData,
        });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, data: formatFAQ(updated) });
  } catch (error: any) {
    console.error('updateFAQ error:', error);
    res.status(400).json({ success: false, message: 'Failed to update FAQ', error: error?.message || String(error) });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadFAQsFromDisk();
    const updated = list.filter((f) => f._id !== rawId && f.id !== id);
    saveFAQsToDisk(updated);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.fAQ.delete({ where: { id } });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    console.error('deleteFAQ error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
