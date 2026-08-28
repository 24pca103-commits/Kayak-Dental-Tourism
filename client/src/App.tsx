import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import TeamPage from './pages/TeamPage';
import FAQsPage from './pages/FAQsPage';
import ContactPage from './pages/ContactPage';
import TestimonialsPage from './pages/TestimonialsPage';
import AppointmentPage from './pages/AppointmentPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminServices from './pages/admin/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminFAQs from './pages/admin/AdminFAQs';

/* ── Public Layout ────────────────────────────────── */
const PublicLayout: React.FC = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

/* ── Protected Admin Route ────────────────────────── */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('kayal_admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:id" element={<TeamPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/book-appointment" element={<AppointmentPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/appointments" element={<RequireAuth><AdminAppointments /></RequireAuth>} />
        <Route path="/admin/doctors" element={<RequireAuth><AdminDoctors /></RequireAuth>} />
        <Route path="/admin/services" element={<RequireAuth><AdminServices /></RequireAuth>} />
        <Route path="/admin/testimonials" element={<RequireAuth><AdminTestimonials /></RequireAuth>} />
        <Route path="/admin/faqs" element={<RequireAuth><AdminFAQs /></RequireAuth>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
