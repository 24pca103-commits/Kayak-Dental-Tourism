import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Team', path: '/team' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Contact', path: '/contact' },
  ];

  if (isAdmin) return null;

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src="/assets/kayal-brand-logo.png" alt="KAYAL Dental Care" className="navbar__logo-img" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
          <a href="tel:+919876543210" className="navbar__phone">
            <Phone size={14} />
            +91 98765 43210
          </a>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/book-appointment')}
          >
            Book Appointment
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar__mobile-link ${location.pathname === link.path ? 'navbar__mobile-link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="btn btn-primary w-full"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/book-appointment')}
        >
          Book Appointment
        </button>
      </div>
    </header>
  );
};

export default Navbar;
