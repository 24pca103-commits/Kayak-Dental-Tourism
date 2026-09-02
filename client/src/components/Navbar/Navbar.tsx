import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import './Navbar.css';

interface SubMenuItem {
  label: string;
  path: string;
  isExternal?: boolean;
}

interface MenuItem {
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
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
    setActiveMobileDropdown(null);
  }, [location]);

  const navMenuItems: MenuItem[] = [
    { label: 'Home', path: '/' },
    {
      label: 'About',
      path: '/about',
      subItems: [
        { label: 'About Us', path: '/about' },
        { label: 'Our Doctors', path: '/team' },
        { label: 'Facilities', path: '/about' },
        { label: 'Mission', path: '/about' },
      ],
    },
    {
      label: 'Treatments',
      path: '/services',
      subItems: [
        { label: 'Dental Implants', path: '/services/dental-implants' },
        { label: 'Full Mouth Rehabilitation', path: '/services/full-mouth-rehabilitation' },
        { label: 'Cosmetic Dentistry', path: '/services/cosmetic-dentistry' },
        { label: 'Crowns & Bridges', path: '/services/crowns-and-bridges' },
        { label: 'Root Canal Treatment', path: '/services/root-canal-treatment' },
        { label: 'Orthodontics', path: '/services/orthodontics' },
        { label: 'Oral & Maxillofacial Surgery', path: '/services/oral-surgery' },
        { label: 'Pediatric Dentistry', path: '/services/pediatric-dentistry' },
      ],
    },
    {
      label: 'Patient Resources',
      path: '/patient-resources',
      subItems: [
        { label: 'FAQs', path: '/patient-resources' },
        { label: 'Checklists', path: '/patient-resources' },
        { label: 'Care Guide', path: '/patient-resources' },
      ],
    },
    {
      label: 'Dental Tourism',
      path: '/dental-tourism',
      subItems: [
        { label: 'Why India', path: '/dental-tourism' },
        { label: 'Cost Comparison', path: '/dental-tourism' },
        { label: 'Patient Journey', path: '/dental-tourism' },
        { label: 'Testimonials', path: '/testimonials' },
      ],
    },
    {
      label: 'Travel Info',
      path: '/travel-visa',
      subItems: [
        { label: 'Visa', path: '/travel-visa' },
        { label: 'Invitation Letter', path: '/travel-visa' },
        { label: 'Airport Pickup', path: '/travel-visa' },
        { label: 'Accommodation', path: '/travel-visa' },
        { label: 'Travel Tips', path: '/travel-visa' },
      ],
    },
  ];

  const consultationSubItems: SubMenuItem[] = [
    { label: 'Free Consultation', path: '/online-consultation' },
    { label: 'How It Works', path: '/online-consultation' },
    { label: 'Treatment Plan', path: '/online-consultation' },
  ];

  const contactSubItems: SubMenuItem[] = [
    { label: 'Enquiry', path: '/contact' },
    { label: 'WhatsApp', path: 'https://wa.me/919876543210', isExternal: true },
    { label: 'Contact Details', path: '/contact' },
    { label: 'Map', path: '/contact' },
  ];

  if (isAdmin) return null;

  const toggleMobileDropdown = (label: string) => {
    setActiveMobileDropdown(prev => (prev === label ? null : label));
  };

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={() => handleNavClick('/')}>
          <img src="/assets/kayal-brand-logo.png" alt="KAYAL Dental Care" className="navbar__logo-img" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar__nav">
          {navMenuItems.map((item) => (
            <div key={item.label} className="navbar__menu-item-wrap">
              <Link
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`navbar__link ${location.pathname === item.path ? 'navbar__link--active' : ''}`}
              >
                {item.label}
                {item.subItems && <ChevronDown size={14} className="navbar__chevron" />}
              </Link>

              {item.subItems && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-inner">
                    {item.subItems.map((sub, i) => (
                      <Link key={i} to={sub.path} className="navbar__dropdown-item">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Buttons (Right / Left Side Actions) */}
        <div className="navbar__actions">
          {/* Contact Dropdown */}
          <div className="navbar__menu-item-wrap">
            <Link to="/contact" className="navbar__phone">
              <Phone size={14} />
              Contact <ChevronDown size={12} className="navbar__chevron" />
            </Link>
            <div className="navbar__dropdown navbar__dropdown--right">
              <div className="navbar__dropdown-inner">
                {contactSubItems.map((sub, i) => (
                  sub.isExternal ? (
                    <a key={i} href={sub.path} target="_blank" rel="noopener noreferrer" className="navbar__dropdown-item">
                      {sub.label} ↗
                    </a>
                  ) : (
                    <Link key={i} to={sub.path} className="navbar__dropdown-item">
                      {sub.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Book Online Consultation CTA Dropdown */}
          <div className="navbar__menu-item-wrap">
            <button
              className="btn btn-primary btn-sm navbar__cta-btn"
              onClick={() => navigate('/online-consultation')}
            >
              Book Online Consultation <ChevronDown size={14} className="navbar__chevron" />
            </button>
            <div className="navbar__dropdown navbar__dropdown--right">
              <div className="navbar__dropdown-inner">
                {consultationSubItems.map((sub, i) => (
                  <Link key={i} to={sub.path} className="navbar__dropdown-item">
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
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
        {navMenuItems.map((item) => (
          <div key={item.label} className="navbar__mobile-group">
            <div className="navbar__mobile-header">
              <Link
                to={item.path}
                className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''}`}
              >
                {item.label}
              </Link>
              {item.subItems && (
                <button
                  className="navbar__mobile-toggle"
                  onClick={() => toggleMobileDropdown(item.label)}
                >
                  <ChevronDown
                    size={16}
                    style={{
                      transform: activeMobileDropdown === item.label ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
              )}
            </div>

            {item.subItems && activeMobileDropdown === item.label && (
              <div className="navbar__mobile-sublist">
                {item.subItems.map((sub, i) => (
                  <Link key={i} to={sub.path} className="navbar__mobile-subitem">
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="navbar__mobile-actions">
          <button
            className="btn btn-primary w-full"
            onClick={() => navigate('/online-consultation')}
          >
            Book Online Consultation
          </button>
          <div className="navbar__mobile-contact-links">
            <Link to="/contact" className="navbar__mobile-subitem">Contact Us</Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="navbar__mobile-subitem">WhatsApp Us ↗</a>
          </div>
        </div>
      </div>
    </header>
  );
}
