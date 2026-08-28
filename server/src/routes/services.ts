import { Router } from 'express';
import {
  getServices,
  getAllServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public
router.get('/', getServices);
router.get('/slug/:slug', getServiceBySlug);

// Admin protected
router.get('/admin/all', protect, adminOnly, getAllServices);
router.post('/', protect, adminOnly, upload.single('image'), createService);
router.put('/:id', protect, adminOnly, upload.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

export default router;
