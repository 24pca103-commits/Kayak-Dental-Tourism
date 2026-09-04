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
import AboutPage from './pages/AboutPage';
import DentalTourismPage from './pages/DentalTourismPage';
import TravelVisaPage from './pages/TravelVisaPage';
import PatientResourcesPage from './pages/PatientResourcesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminServices from './pages/admin/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminFAQs from './pages/admin/AdminFAQs';
import WhatsAppIcon from './components/icons/WhatsAppIcon';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ── Scroll To Top & Section Anchors On Navigation ───── */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};

/* ── Public Layout ────────────────────────────────── */
const PublicLayout: React.FC = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
    {/* ── Floating WhatsApp Button (Bottom Right) ── */}
    <a
      href="https://wa.me/919876543210?text=Hello%20Kayal%20Dental%20Care"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(37,211,102,0.45)',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* WhatsApp official icon */}
      <WhatsAppIcon size={28} color="#ffffff" />
    </a>
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
      <ScrollToTop />
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/dental-tourism" element={<DentalTourismPage />} />
          <Route path="/travel-visa" element={<TravelVisaPage />} />
          <Route path="/patient-resources" element={<PatientResourcesPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:id" element={<TeamPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/online-consultation" element={<AppointmentPage />} />
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
