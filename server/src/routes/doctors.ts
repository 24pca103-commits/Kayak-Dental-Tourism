import { Router } from 'express';
import {
  getDoctors,
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Admin protected
router.get('/admin/all', protect, adminOnly, getAllDoctors);
router.post('/', protect, adminOnly, upload.single('image'), createDoctor);
router.put('/:id', protect, adminOnly, upload.single('image'), updateDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);

export default router;
