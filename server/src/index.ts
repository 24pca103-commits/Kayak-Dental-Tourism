import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctors';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';
import testimonialRoutes from './routes/testimonials';
import faqRoutes from './routes/faqs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/faqs', faqRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'KAYAL Dental API is running 🦷' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
