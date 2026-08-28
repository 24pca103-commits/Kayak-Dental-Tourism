import { Router } from 'express';
import {
  getAppointments,
  getAppointmentStats,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public – book appointment
router.post('/', createAppointment);

// Admin protected
router.get('/', protect, adminOnly, getAppointments);
router.get('/stats', protect, adminOnly, getAppointmentStats);
router.put('/:id', protect, adminOnly, updateAppointment);
router.delete('/:id', protect, adminOnly, deleteAppointment);

export default router;
