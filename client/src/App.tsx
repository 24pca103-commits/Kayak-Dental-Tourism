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
import AdminFeedback from './pages/admin/AdminFeedback';
import { ArrowUp } from 'lucide-react';
import WhatsAppIcon from './components/icons/WhatsAppIcon';
import InstagramIcon from './components/icons/InstagramIcon';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* ── Scroll To Top & Section Anchors On Navigation ───── */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToTarget = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      if (!scrollToTarget()) {
        const t1 = setTimeout(scrollToTarget, 80);
        const t2 = setTimeout(scrollToTarget, 250);
        const t3 = setTimeout(scrollToTarget, 550);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};

/* ── Public Layout ────────────────────────────────── */
const PublicLayout: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />

      {/* ── Floating Action Buttons (Scroll-to-top, Instagram, WhatsApp) ── */}
      <div className="floating-actions-container">
        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="floating-action-btn floating-scroll-top"
          >
            <ArrowUp size={24} color="#ffffff" strokeWidth={2.5} />
          </button>
        )}

        {/* Instagram Button */}
        <a
          href="https://www.instagram.com/kayal_dentalcare/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          className="floating-action-btn floating-instagram"
        >
          <InstagramIcon size={26} color="#ffffff" />
        </a>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/917867926159?text=Hello%20Kayal%20Dental%20Care"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="floating-action-btn floating-whatsapp"
        >
          <WhatsAppIcon size={28} color="#ffffff" />
        </a>
      </div>
    </>
  );
};

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
        <Route path="/admin/feedback" element={<RequireAuth><AdminFeedback /></RequireAuth>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
