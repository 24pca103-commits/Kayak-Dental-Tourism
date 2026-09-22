import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  ArrowRight,
  Search,
  Sparkles,
  Smile,
  Info,
  Users,
  Building2,
  Target,
  Star,
  MessageSquare,
  Video,
  ClipboardList,
  HeartPulse,
  FileText,
  Mail,
  Plane,
  Hotel,
  Compass,
  HelpCircle,
  Globe,
  DollarSign,
  Navigation,
  ShieldCheck,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import '../../styles/Navbar.css';

interface SubMenuItem {
  label: string;
  path: string;
  isExternal?: boolean;
  image?: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  label: string;
  path: string;
  subItems?: SubMenuItem[];
  isTwoColumn?: boolean;
}

interface SearchItem {
  title: string;
  category: string;
  description: string;
  path: string;
  keywords?: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // Treatments
  { title: 'Dental Implants', category: 'Treatments', description: 'Permanent, natural-looking replacement for missing teeth', path: '/services/dental-implants', keywords: ['implants', 'teeth', 'tooth replacement', 'fixed teeth'] },
  { title: 'Full Mouth Rehabilitation', category: 'Treatments', description: 'Complete smile restoration combining implants, crowns, and digital 3D smile design', path: '/services/full-mouth-rehabilitation', keywords: ['rehab', 'full mouth', 'reconstruction', 'makeover'] },
  { title: 'Cosmetic Dentistry', category: 'Treatments', description: 'Veneers, bonding, and aesthetic transformations', path: '/services/cosmetic-dentistry', keywords: ['veneers', 'bonding', 'glamour', 'cosmetic', 'smile design'] },
  { title: 'Crowns & Bridges', category: 'Treatments', description: 'Premium Zirconia and PFM restorations engineered for maximum strength', path: '/services/crowns-and-bridges', keywords: ['crowns', 'bridges', 'caps', 'zirconia'] },
  { title: 'Root Canal Treatment', category: 'Treatments', description: 'Pain-free single sitting endodontic therapy', path: '/services/root-canal-treatment', keywords: ['rct', 'infection', 'toothache', 'painless'] },
  { title: 'Teeth Alignment', category: 'Treatments', description: 'Advanced orthodontic alignment solutions for a healthy smile', path: '/services/teeth-alignment', keywords: ['align', 'crooked', 'straightening', 'alignment'] },
  { title: 'Braces', category: 'Treatments', description: 'Metal, ceramic and self-ligating braces for teeth straightening', path: '/services/braces', keywords: ['braces', 'ceramic braces', 'metal clips', 'orthodontics'] },
  { title: 'Clear Aligners', category: 'Treatments', description: 'Invisible, comfortable custom aligners', path: '/services/clear-aligners', keywords: ['invisalign', 'invisible braces', 'transparent', 'aligners'] },
  { title: 'Oral & Maxillofacial Surgery', category: 'Treatments', description: 'Expert surgical solutions for wisdom teeth, jaw, and facial conditions', path: '/services/oral-surgery', keywords: ['surgery', 'wisdom teeth', 'extraction', 'jaw', 'maxillofacial'] },
  { title: 'Pediatric Dentistry', category: 'Treatments', description: 'Gentle and fun dental care tailored specifically for children', path: '/services/pediatric-dentistry', keywords: ['kids', 'children', 'baby teeth', 'pediatric'] },

  // Doctors
  { title: 'Dr. V.Sahaana, BDS., FDS., FMC.', category: 'Doctors', description: 'Founder & Chief Dental Surgeon, Root Canal Specialist', path: '/about', keywords: ['sahaana', 'founder', 'director', 'root canal', 'chief doctor', 'qualification'] },
  { title: 'Our Expert Dental Team', category: 'Doctors', description: 'Meet our team of MDS specialists and surgeons', path: '/team', keywords: ['doctors', 'surgeons', 'specialists', 'dentists'] },

  // Dental Tourism
  { title: 'Dental Tourism in India', category: 'Dental Tourism', description: 'World-class dental treatment at up to 70% lower costs', path: '/dental-tourism', keywords: ['tourism', 'international', 'travel', 'savings', 'foreigner'] },
  { title: 'Cost Comparison', category: 'Dental Tourism', description: 'Compare dental treatment costs in India vs USA, UK & Australia', path: '/dental-tourism#cost-comparison', keywords: ['pricing', 'cost', 'savings', 'usa', 'uk', 'australia', 'rates'] },
  { title: 'Why Choose India', category: 'Dental Tourism', description: 'International standards, zero waiting list, expert specialists', path: '/dental-tourism#why-india', keywords: ['benefits', 'standards', 'accredited', 'hygiene'] },
  { title: 'Patient Journey', category: 'Dental Tourism', description: 'Step-by-step travel, treatment, and recovery roadmap', path: '/dental-tourism#journey', keywords: ['roadmap', 'steps', 'timeline', 'process'] },
  { title: 'Quality & Safety Standards', category: 'Dental Tourism', description: 'ISO certified sterilization and advanced digital diagnostics', path: '/dental-tourism#safety', keywords: ['sterilization', 'hygiene', 'safety', 'iso'] },

  // Patient Resources
  { title: 'Medical Visa Guide', category: 'Patient Resources', description: 'E-Medical Visa assistance and required documents', path: '/patient-resources#visa', keywords: ['visa', 'embassy', 'invitation letter', 'travel documents'] },
  { title: 'Airport Pickup & Transport', category: 'Patient Resources', description: 'Dedicated complimentary pickup from Coimbatore International Airport', path: '/patient-resources#pickup', keywords: ['airport', 'pickup', 'coimbatore', 'cab', 'transfer', 'transport'] },
  { title: 'Accommodation & Hotels', category: 'Patient Resources', description: 'Partner luxury and budget hotels near our clinic', path: '/patient-resources#hotels', keywords: ['hotel', 'stay', 'rooms', 'resort', 'accommodation'] },
  { title: 'Pre-Treatment Checklist', category: 'Patient Resources', description: 'What to prepare before arriving for dental treatment', path: '/patient-resources#checklist', keywords: ['preparation', 'checklist', 'reports', 'x-rays'] },
  { title: 'Post-Treatment Care Guide', category: 'Patient Resources', description: 'Care tips and recovery guidance after procedures', path: '/patient-resources#care-guide', keywords: ['recovery', 'aftercare', 'instructions', 'healing'] },
  { title: 'Frequently Asked Questions (FAQs)', category: 'Patient Resources', description: 'Answers to common questions about dental care and travel', path: '/patient-resources#faqs', keywords: ['questions', 'help', 'faq', 'answers'] },

  // Testimonials
  { title: 'Patient Reviews & Feedback', category: 'Testimonials', description: 'Read authentic patient feedback and 5-star experiences', path: '/testimonials#reviews', keywords: ['reviews', 'testimonials', 'ratings', 'feedback', 'stories'] },
  { title: 'Patient Feedback Stats', category: 'Testimonials', description: '5.0 rating, 5,000+ transformed smiles, 100% painless care', path: '/testimonials#feedback', keywords: ['stats', 'ratings', 'feedback', 'satisfaction'] },
  { title: 'Video Testimonials', category: 'Testimonials', description: 'Watch video stories of transformed smiles', path: '/testimonials#videos', keywords: ['video', 'watch', 'patient video', 'youtube'] },

  // Consultation & Contact
  { title: 'Book Online Consultation', category: 'Consultation', description: 'Schedule a virtual dental consultation with our chief dentists', path: '/online-consultation', keywords: ['video call', 'teleconsultation', 'appointment', 'booking'] },
  { title: 'Contact & Clinic Location', category: 'Contact', description: 'Get in touch, view clinic map and clinic phone numbers', path: '/contact', keywords: ['location', 'phone', 'email', 'address', 'directions'] },
  { title: 'About Kayal Dental Care', category: 'About', description: 'Our history, mission, vision, and clinic facilities', path: '/about', keywords: ['about', 'history', 'mission', 'vision', 'facilities'] }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    setMenuOpen(false);
    setActiveMobileDropdown(null);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [menuOpen]);

  // Focus search input when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCategory('All');
    }
  }, [searchOpen]);

  // Handle ESC key to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const navMenuItems: MenuItem[] = [
    { label: 'Home', path: '/' },
    {
      label: 'About',
      path: '/about',
      subItems: [
        { label: 'About Us', path: '/about', icon: <Info size={15} /> },
        { label: 'Our Doctors', path: '/team', icon: <Users size={15} /> },
        { label: 'Facilities', path: '/about#facilities', icon: <Building2 size={15} /> },
        { label: 'Mission & Vision', path: '/about#mission', icon: <Target size={15} /> },
      ],
    },
    {
      label: 'Testimonials',
      path: '/testimonials',
      subItems: [
        { label: 'Patient Reviews', path: '/testimonials#reviews', icon: <Star size={15} /> },
        { label: 'Patient Feedback', path: '/testimonials#feedback', icon: <MessageSquare size={15} /> },
        { label: 'Review Videos', path: '/testimonials#videos', icon: <Video size={15} /> },
      ],
    },
    {
      label: 'Treatments',
      path: '/services',
      isTwoColumn: true,
      subItems: [
        { label: 'Dental Implants', path: '/services/dental-implants', image: '/assets/about-clinic-real.jpg' },
        { label: 'Full Mouth Rehabilitation', path: '/services/full-mouth-rehabilitation', image: '/assets/treatment-2-rehab.jpg' },
        { label: 'Cosmetic Dentistry', path: '/services/cosmetic-dentistry', image: '/assets/treatment-3-cosmetic.png' },
        { label: 'Crowns & Bridges', path: '/services/crowns-and-bridges', image: '/assets/treatment-4-crowns.jpg' },
        { label: 'Root Canal Treatment', path: '/services/root-canal-treatment', image: '/assets/treatment-5-root-canal.jpg' },
        { label: 'Teeth Alignment', path: '/services/teeth-alignment', image: '/assets/card-orthodontics-hd.jpg' },
        { label: 'Braces', path: '/services/braces', image: '/assets/treatment-orthodontics.jpg' },
        { label: 'Clear Aligners', path: '/services/clear-aligners', image: '/assets/card-braces.png' },
        { label: 'Oral & Maxillofacial Surgery', path: '/services/oral-surgery', image: '/assets/treatment-7-oral-surgery.jpg' },
        { label: 'Pediatric Dentistry', path: '/services/pediatric-dentistry', image: '/assets/treatment-8-pediatric-child.jpg' },
      ],
    },
    {
      label: 'Patient Resources',
      path: '/patient-resources',
      subItems: [
        { label: 'Pre-Treatment Checklist', path: '/patient-resources#checklist', icon: <ClipboardList size={15} /> },
        { label: 'Post-Treatment Care Guide', path: '/patient-resources#care-guide', icon: <HeartPulse size={15} /> },
        { label: 'Medical Visa Guide', path: '/patient-resources#visa', icon: <FileText size={15} /> },
        { label: 'Visa Invitation', path: '/patient-resources#invitation', icon: <Mail size={15} /> },
        { label: 'Airport Pickup & Transport', path: '/patient-resources#pickup', icon: <Plane size={15} /> },
        { label: 'Accommodation', path: '/patient-resources#hotels', icon: <Hotel size={15} /> },
        { label: 'Local Travel Tips', path: '/patient-resources#tips', icon: <Compass size={15} /> },
        { label: 'FAQs', path: '/patient-resources#faqs', icon: <HelpCircle size={15} /> },
      ],
    },
    {
      label: 'Dental Tourism',
      path: '/dental-tourism',
      subItems: [
        { label: 'Why Choose India', path: '/dental-tourism#why-india', icon: <Globe size={15} /> },
        { label: 'Cost Comparison', path: '/dental-tourism#cost-comparison', icon: <DollarSign size={15} /> },
        { label: 'Patient Journey', path: '/dental-tourism#journey', icon: <Navigation size={15} /> },
        { label: 'Quality & Safety', path: '/dental-tourism#safety', icon: <ShieldCheck size={15} /> },
        { label: 'Patient Testimonials (Videos)', path: '/dental-tourism#testimonials', icon: <Video size={15} /> },
      ],
    },
  ];

  const contactSubItems: SubMenuItem[] = [
    { label: 'Enquiry Form', path: '/contact#enquiry', icon: <Mail size={15} /> },
    { label: 'WhatsApp', path: 'https://wa.me/917867926159', isExternal: true },
    { label: 'Phone & Email', path: '/contact#details', icon: <PhoneCall size={15} /> },
    { label: 'Map / Location', path: '/contact#map', icon: <MapPin size={15} /> },
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

  const handleAnchorClick = (path: string, e?: React.MouseEvent) => {
    setMenuOpen(false);
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      if (location.pathname === basePath) {
        if (e) e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.history.pushState(null, '', path);
        return;
      }
    }
  };

  const handleSearchResultClick = (path: string) => {
    setSearchOpen(false);
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      if (location.pathname === basePath) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    navigate(path);
  };

  const categories = [
    { id: 'All', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'Treatments', label: 'Treatments', icon: <Smile size={14} /> },
    { id: 'Dental Tourism', label: 'Dental Tourism', icon: <Globe size={14} /> },
    { id: 'Patient Resources', label: 'Resources', icon: <ClipboardList size={14} /> },
    { id: 'Doctors', label: 'Doctors', icon: <Users size={14} /> },
    { id: 'Testimonials', label: 'Reviews', icon: <Star size={14} /> },
  ];

  const filteredSearchResults = SEARCH_DATABASE.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesTitle = item.title.toLowerCase().includes(query);
    const matchesDesc = item.description.toLowerCase().includes(query);
    const matchesCat = item.category.toLowerCase().includes(query);
    const matchesKeywords = item.keywords?.some(kw => kw.toLowerCase().includes(query));

    return matchesCategory && (matchesTitle || matchesDesc || matchesCat || matchesKeywords);
  });

  return (
    <>
      <header className="navbar">
        <div className="navbar__container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => handleNavClick('/')}>
            <img
              src="/assets/kayal-brand-logo.png"
              alt="KAYAL Dental Care"
              className="navbar__logo-img"
              style={{ height: '62px', width: 'auto', objectFit: 'contain' }}
            />
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
                  <div className={`navbar__dropdown ${item.isTwoColumn ? 'navbar__dropdown--two-col' : ''}`}>
                    <div className={`navbar__dropdown-inner ${item.isTwoColumn ? 'navbar__dropdown-inner--two-col' : ''}`}>
                      {item.subItems.map((sub, i) => (
                        <Link
                          key={i}
                          to={sub.path}
                          className="navbar__dropdown-item"
                          onClick={(e) => handleAnchorClick(sub.path, e)}
                        >
                          {sub.image ? (
                            <span className="navbar__dropdown-thumb">
                              <img src={sub.image} alt={sub.label} />
                            </span>
                          ) : sub.icon ? (
                            <span className="navbar__dropdown-icon-box">
                              {sub.icon}
                            </span>
                          ) : null}
                          <span>{sub.label}</span>
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
            {/* Global Search Button */}
            <button
              type="button"
              className="navbar__search-btn"
              onClick={() => setSearchOpen(true)}
              title="Search treatments, doctors, services..."
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Contact Dropdown - Icon Only */}
            <div className="navbar__menu-item-wrap">
              <Link to="/contact" className="navbar__contact-icon-btn" title="Contact Us" aria-label="Contact Us">
                <Phone size={18} />
              </Link>
              <div className="navbar__dropdown navbar__dropdown--right">
                <div className="navbar__dropdown-inner">
                  {contactSubItems.map((sub, i) => (
                    sub.label === 'WhatsApp' ? (
                      <a
                        key={i}
                        href={sub.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar__dropdown-item"
                        style={{
                          justifyContent: 'flex-start',
                          gap: '8px',
                          background: '#25D366',
                          color: '#ffffff',
                          fontWeight: 700,
                          borderRadius: '8px',
                          margin: '3px 0',
                        }}
                      >
                        <WhatsAppIcon size={16} color="#ffffff" />
                        <span style={{ color: '#ffffff' }}>{sub.label} ↗</span>
                      </a>
                    ) : sub.isExternal ? (
                      <a key={i} href={sub.path} target="_blank" rel="noopener noreferrer" className="navbar__dropdown-item" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        {sub.icon && <span className="navbar__dropdown-icon-box">{sub.icon}</span>}
                        <span>{sub.label} ↗</span>
                      </a>
                    ) : (
                      <Link
                        key={i}
                        to={sub.path}
                        className="navbar__dropdown-item"
                        onClick={(e) => handleAnchorClick(sub.path, e)}
                      >
                        {sub.icon && <span className="navbar__dropdown-icon-box">{sub.icon}</span>}
                        <span>{sub.label}</span>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Book Online Consultation CTA (Direct Button, No Dropdown) */}
            <button
              className="btn btn-primary btn-sm navbar__cta-btn"
              onClick={() => navigate('/online-consultation')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              Book Online Consultation <ArrowRight size={16} className="navbar__cta-arrow" color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
            </button>
          </div>

          {/* Mobile Search Icon (visible only on mobile, before hamburger) */}
          <button
            type="button"
            className="navbar__mobile-search-icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

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
          {/* Mobile Search Input trigger */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(36, 224, 225, 0.4)',
                color: '#24E0E1',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
              }}
            >
              <Search size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search treatments, doctors...</span>
            </button>
          </div>

          {navMenuItems.map((item) => (
            <div key={item.label} className="navbar__mobile-group">
              <div className="navbar__mobile-header">
                <Link
                  to={item.path}
                  className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.subItems && (
                  <button
                    type="button"
                    className={`navbar__mobile-toggle ${activeMobileDropdown === item.label ? 'navbar__mobile-toggle--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMobileDropdown(item.label);
                    }}
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    {activeMobileDropdown === item.label ? (
                      <ChevronUp size={25} strokeWidth={2.8} />
                    ) : (
                      <ChevronDown size={25} strokeWidth={2.8} />
                    )}
                  </button>
                )}
              </div>

              {item.subItems && activeMobileDropdown === item.label && (
                <div className="navbar__mobile-sublist">
                  {item.subItems.map((sub, i) => (
                    <Link
                      key={i}
                      to={sub.path}
                      className="navbar__mobile-subitem"
                      onClick={(e) => {
                        setMenuOpen(false);
                        handleAnchorClick(sub.path, e);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      {sub.image ? (
                        <span className="navbar__dropdown-thumb" style={{ width: 20, height: 20, minWidth: 20 }}>
                          <img src={sub.image} alt={sub.label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                        </span>
                      ) : sub.icon ? (
                        <span className="navbar__mobile-subitem-icon">
                          {sub.icon}
                        </span>
                      ) : null}
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Contact Group with Submenu */}
          <div className="navbar__mobile-group">
            <div className="navbar__mobile-header">
              <Link
                to="/contact"
                className={`navbar__mobile-link ${location.pathname === '/contact' ? 'navbar__mobile-link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <button
                type="button"
                className={`navbar__mobile-toggle ${activeMobileDropdown === 'Contact' ? 'navbar__mobile-toggle--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileDropdown('Contact');
                }}
                aria-label="Toggle Contact submenu"
              >
                {activeMobileDropdown === 'Contact' ? (
                  <ChevronUp size={25} strokeWidth={2.8} />
                ) : (
                  <ChevronDown size={25} strokeWidth={2.8} />
                )}
              </button>
            </div>

            {activeMobileDropdown === 'Contact' && (
              <div className="navbar__mobile-sublist">
                {contactSubItems.map((sub, i) => (
                  sub.label === 'WhatsApp' ? (
                    <a
                      key={i}
                      href={sub.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__mobile-subitem"
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#25D366' }}
                    >
                      <WhatsAppIcon size={16} color="#25D366" />
                      <span>{sub.label} ↗</span>
                    </a>
                  ) : sub.isExternal ? (
                    <a
                      key={i}
                      href={sub.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__mobile-subitem"
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      {sub.icon && <span className="navbar__mobile-subitem-icon">{sub.icon}</span>}
                      <span>{sub.label} ↗</span>
                    </a>
                  ) : (
                    <Link
                      key={i}
                      to={sub.path}
                      className="navbar__mobile-subitem"
                      onClick={(e) => {
                        setMenuOpen(false);
                        handleAnchorClick(sub.path, e);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      {sub.icon && <span className="navbar__mobile-subitem-icon">{sub.icon}</span>}
                      <span>{sub.label}</span>
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>

          <div className="navbar__mobile-actions">
            <button
              className="btn btn-primary w-full"
              onClick={() => navigate('/online-consultation')}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              Book Online Consultation <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
            </button>
            <div className="navbar__mobile-contact-links">
              <Link to="/contact" className="navbar__mobile-contact-btn" onClick={() => setMenuOpen(false)}>
                <PhoneCall size={15} /> <span>Contact Us</span>
              </Link>
              <a href="https://wa.me/917867926159" target="_blank" rel="noopener noreferrer" className="navbar__mobile-whatsapp-btn">
                <WhatsAppIcon size={16} color="#ffffff" /> <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      {searchOpen && (
        <div className="navbar-search-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="navbar-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="navbar-search-header">
              <Search size={20} className="navbar-search-input-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="navbar-search-input"
                placeholder="Search treatments, doctors, services, FAQs, tourism info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="navbar-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="navbar-search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search modal"
              >
                <X size={20} strokeWidth={2.5} color="#451271" style={{ color: '#451271', stroke: '#451271' }} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="navbar-search-categories">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`navbar-search-cat-btn ${selectedCategory === cat.id ? 'navbar-search-cat-btn--active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="navbar-search-results">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((item, index) => (
                  <div
                    key={index}
                    className="navbar-search-result-item"
                    onClick={() => handleSearchResultClick(item.path)}
                  >
                    <div className="navbar-search-result-content">
                      <div className="navbar-search-result-top">
                        <span className="navbar-search-result-title">{item.title}</span>
                        <span className="navbar-search-result-badge">{item.category}</span>
                      </div>
                      <p className="navbar-search-result-desc">{item.description}</p>
                    </div>
                    <ArrowRight size={16} className="navbar-search-result-arrow" />
                  </div>
                ))
              ) : (
                <div className="navbar-search-empty">
                  <p>No results found for "{searchQuery}"</p>
                  <span>Try searching for 'Implants', 'Doctors', 'Visa', 'Cost', or 'Root Canal'</span>
                </div>
              )}
            </div>

            <div className="navbar-search-footer">
              <span>Press <kbd>ESC</kbd> to close</span>
              <span>{filteredSearchResults.length} result{filteredSearchResults.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
