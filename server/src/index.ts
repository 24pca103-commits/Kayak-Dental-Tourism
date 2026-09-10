import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctors';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';
import testimonialRoutes from './routes/testimonials';
import faqRoutes from './routes/faqs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MySQL via Prisma
prisma.$connect()
  .then(() => console.log('✅ MySQL connected successfully via Prisma'))
  .catch((err) => console.error('❌ MySQL connection error:', err));

// Middleware - Allow all origins (Vercel, localhost, custom domains) with credentials
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mounted with /api and directly (handles any VITE_API_URL format)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/doctors', doctorRoutes);
app.use('/doctors', doctorRoutes);

app.use('/api/services', serviceRoutes);
app.use('/services', serviceRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/appointments', appointmentRoutes);

app.use('/api/testimonials', testimonialRoutes);
app.use('/testimonials', testimonialRoutes);

app.use('/api/faqs', faqRoutes);
app.use('/faqs', faqRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'KAYAL Dental MySQL API is running 🦷' });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'KAYAL Dental MySQL API is running 🦷' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
