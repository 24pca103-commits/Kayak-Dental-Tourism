import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const DATA_FILE = path.join(__dirname, '../../data/feedbacks.json');

export interface FeedbackItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  rating?: number;
  status?: string;
  createdAt: string;
  hasVideo?: boolean;
  videoKey?: string;
  videoUrl?: string;
  videoName?: string;
  videoSize?: string;
  isPublishedToTestimonials?: boolean;
}

const INITIAL_DEMOS: FeedbackItem[] = [
  {
    _id: 'fb_demo_1',
    name: 'Michael Hansen',
    phone: '+45 20 12 34 56',
    email: 'michael.hansen@example.com',
    subject: 'Dental Tourism Consultation Inquiry',
    message: 'Hello Kayal Dental team, I am planning a trip to Coimbatore from Denmark for dental implant treatment. Could you please share the procedure details and estimated duration?',
    rating: 5,
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    hasVideo: false,
    isPublishedToTestimonials: false,
  },
  {
    _id: 'fb_demo_2',
    name: 'Marcus Tan',
    phone: '+65 9123 4567',
    email: 'marcus.tan@example.com',
    subject: 'Full Mouth Rehab & Smile Makeover',
    message: 'Hi! I would like to inquire about full mouth rehabilitation options. I will be visiting Coimbatore next month.',
    rating: 5,
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    hasVideo: false,
    isPublishedToTestimonials: false,
  },
];

let memoryFeedbacks: FeedbackItem[] = [];

function loadFromDisk(): FeedbackItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DEMOS, null, 2), 'utf-8');
    return INITIAL_DEMOS;
  } catch (err) {
    console.error('Error reading feedbacks.json:', err);
    return INITIAL_DEMOS;
  }
}

function saveToDisk(list: FeedbackItem[]) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing feedbacks.json:', err);
  }
}

memoryFeedbacks = loadFromDisk();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: memoryFeedbacks.length,
    data: memoryFeedbacks,
  });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      subject,
      message,
      rating,
      hasVideo,
      videoKey,
      videoUrl,
      videoName,
      videoSize,
    } = req.body;

    const newItem: FeedbackItem = {
      _id: 'fb_' + Date.now(),
      name: (name || 'Anonymous Patient').trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: (message || '').trim(),
      rating: typeof rating === 'number' ? rating : 5,
      status: 'unread',
      createdAt: new Date().toISOString(),
      hasVideo: !!hasVideo || !!videoUrl || !!videoKey,
      videoKey: videoKey || undefined,
      videoUrl: videoUrl || undefined,
      videoName: videoName || undefined,
      videoSize: videoSize || undefined,
      isPublishedToTestimonials: false,
    };

    memoryFeedbacks = [newItem, ...memoryFeedbacks];
    saveToDisk(memoryFeedbacks);

    console.log(`[Feedback] New feedback received from: ${newItem.name} (Rating: ${newItem.rating}★)`);

    res.status(201).json({
      success: true,
      message: 'Feedback received successfully',
      data: newItem,
    });
  } catch (err) {
    console.error('Failed to create feedback:', err);
    res.status(500).json({ success: false, message: 'Server error saving feedback' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let found = false;
  memoryFeedbacks = memoryFeedbacks.map((f) => {
    if (f._id === id) {
      found = true;
      return { ...f, ...updates };
    }
    return f;
  });

  if (!found) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }

  saveToDisk(memoryFeedbacks);
  res.json({ success: true, message: 'Feedback updated successfully' });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryFeedbacks = memoryFeedbacks.filter((f) => f._id !== id);
  saveToDisk(memoryFeedbacks);
  res.json({ success: true, message: 'Feedback deleted successfully' });
});

export default router;
