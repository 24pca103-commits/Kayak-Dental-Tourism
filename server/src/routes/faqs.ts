import { Router } from 'express';
import {
  getFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getFAQs);
router.get('/admin/all', protect, adminOnly, getAllFAQs);
router.post('/', protect, adminOnly, createFAQ);
router.put('/:id', protect, adminOnly, updateFAQ);
router.delete('/:id', protect, adminOnly, deleteFAQ);

export default router;
