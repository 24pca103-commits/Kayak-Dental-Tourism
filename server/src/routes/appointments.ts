import { Router } from 'express';
import {
  getAppointments,
  getAppointmentStats,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getBookedSlots,
  upload,
  uploadAppointmentFiles,
} from '../controllers/appointmentController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public – book appointment, upload files & check booked slots
router.post('/upload', upload.array('files', 5), uploadAppointmentFiles);
router.post('/', createAppointment);
router.get('/booked-slots', getBookedSlots);

// Admin protected
router.get('/', protect, adminOnly, getAppointments);
router.get('/stats', protect, adminOnly, getAppointmentStats);
router.put('/:id', protect, adminOnly, updateAppointment);
router.delete('/:id', protect, adminOnly, deleteAppointment);

export default router;

