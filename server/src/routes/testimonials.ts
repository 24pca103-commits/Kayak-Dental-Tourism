import { Router } from 'express';
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getTestimonials);
router.get('/admin/all', protect, adminOnly, getAllTestimonials);
router.post('/', protect, adminOnly, upload.single('image'), createTestimonial);
router.put('/:id', protect, adminOnly, upload.single('image'), updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);

export default router;
