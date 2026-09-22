import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Globe, Target, Heart, Sparkles, Award, ShieldCheck, ChevronLeft, ChevronRight, BookOpen, Eye
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';

import '../styles/HomePage.css';

/* ── Stat counter ── */
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="hero-stat">
    <span className="hero-stat__value">{value}</span>
    <span className="hero-stat__label">{label}</span>
  </div>
);


const ALL_TREATMENTS = [
  {
    title: 'Dental Implants',
    desc: 'Permanent titanium tooth replacements that look, feel, and function 100% naturally.',
    slug: 'dental-implants',
    img: '/assets/about-clinic-real.jpg',
  },
  {
    title: 'Full Mouth Rehabilitation',
    desc: 'Complete smile restoration combining implants, crowns, and digital 3D smile design.',
    slug: 'full-mouth-rehabilitation',
    img: '/assets/treatment-2-rehab.jpg',
  },
  {
    title: 'Cosmetic Dentistry',
    desc: 'Transform your smile with porcelain veneers, smile makeovers, and whitening.',
    slug: 'cosmetic-dentistry',
    img: '/assets/treatment-3-cosmetic.png',
  },
  {
    title: 'Crowns & Bridges',
    desc: 'Premium Zirconia and PFM restorations engineered for maximum strength.',
    slug: 'crowns-and-bridges',
    img: '/assets/treatment-4-crowns.jpg',
  },
  {
    title: 'Root Canal Treatment',
    desc: 'Painless single-visit endodontic therapy designed to save your natural teeth.',
    slug: 'root-canal-treatment',
    img: '/assets/treatment-5-root-canal.jpg',
  },
  {
    title: 'Orthodontics',
    desc: 'Straighten teeth discreetly using clear aligners or traditional ceramic braces.',
    slug: 'orthodontics',
    img: '/assets/treatment-6-orthodontics.png',
  },
  {
    title: 'Oral & Maxillofacial Surgery',
    desc: 'Expert surgical solutions for complex wisdom teeth, jaw, and facial conditions.',
    slug: 'oral-surgery',
    img: '/assets/treatment-7-oral-surgery.jpg',
  },
  {
    title: 'Pediatric Dentistry',
    desc: 'Gentle, painless, and fun dental care tailored specifically for children.',
    slug: 'pediatric-dentistry',
    img: '/assets/treatment-8-pediatric-child.jpg',
  },
];

const HOME_VIDEOS = [
  {
    videoSrc: '/assets/4.mp4',
    name: 'Prashansa Meyn',
    location: 'International Patient',
    tag: 'Root Canals & Crowns',
    stars: 5,
  },
  {
    videoSrc: '/assets/3.mp4',
    name: 'Tony',
    location: 'International Patient',
    tag: 'Root Canals & Dental Checkup',
    stars: 5,
  },
  {
    videoSrc: '/assets/Kayal Dental - Client Review 1.mp4',
    name: 'Anitha',
    location: 'International Patient',
    tag: 'Dental Implants & Smile Makeover',
    stars: 5,
  },
  {
    videoSrc: '/assets/Kayal Dental- Client Review 2.mp4',
    name: 'Marcus Tan',
    location: 'International Patient',
    tag: 'Full Mouth Rehabilitation',
    stars: 5,
  },
];

/* ═══════════════ HOME PAGE ═══════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [whatWeDoIdx, setWhatWeDoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Directional manual scroll indicator states for What We Do
  const [showTreatLeft, setShowTreatLeft] = useState(false);
  const [showTreatRight, setShowTreatRight] = useState(false);
  const treatLeftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const treatRightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerTreatLeft = () => {
    setShowTreatLeft(true);
    setShowTreatRight(false);
    if (treatLeftTimer.current) clearTimeout(treatLeftTimer.current);
    treatLeftTimer.current = setTimeout(() => setShowTreatLeft(false), 1800);
  };

  const triggerTreatRight = () => {
    setShowTreatRight(true);
    setShowTreatLeft(false);
    if (treatRightTimer.current) clearTimeout(treatRightTimer.current);
    treatRightTimer.current = setTimeout(() => setShowTreatRight(false), 1800);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    if (touchStart !== null) {
      const diff = touchStart - currentX;
      if (diff > 15) {
        triggerTreatRight();
      } else if (diff < -15) {
        triggerTreatLeft();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;
    if (isLeftSwipe) {
      setWhatWeDoIdx(prev => (prev + 1) % ALL_TREATMENTS.length);
    } else if (isRightSwipe) {
      setWhatWeDoIdx(prev => (prev - 1 + ALL_TREATMENTS.length) % ALL_TREATMENTS.length);
    }
  };

  const handleTreatWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 12) {
      triggerTreatRight();
    } else if (delta < -12) {
      triggerTreatLeft();
    }
  };

  // Auto-scroll for What We Do on mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setWhatWeDoIdx(prev => (prev + 1) % ALL_TREATMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [testTouchStart, setTestTouchStart] = useState<number | null>(null);
  const [testTouchEnd, setTestTouchEnd] = useState<number | null>(null);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Directional manual scroll indicator states for Home Testimonials
  const [showHomeTestLeft, setShowHomeTestLeft] = useState(false);
  const [showHomeTestRight, setShowHomeTestRight] = useState(false);
  const homeTestLeftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeTestRightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerHomeTestLeft = () => {
    setShowHomeTestLeft(true);
    setShowHomeTestRight(false);
    if (homeTestLeftTimer.current) clearTimeout(homeTestLeftTimer.current);
    homeTestLeftTimer.current = setTimeout(() => setShowHomeTestLeft(false), 1800);
  };

  const triggerHomeTestRight = () => {
    setShowHomeTestRight(true);
    setShowHomeTestLeft(false);
    if (homeTestRightTimer.current) clearTimeout(homeTestRightTimer.current);
    homeTestRightTimer.current = setTimeout(() => setShowHomeTestRight(false), 1800);
  };

  const handleTestWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 12) {
      triggerHomeTestRight();
    } else if (delta < -12) {
      triggerHomeTestLeft();
    }
  };

  const handleTestTouchStart = (e: React.TouchEvent) => {
    setTestTouchEnd(null);
    setTestTouchStart(e.targetTouches[0].clientX);
  };

  const handleTestTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setTestTouchEnd(currentX);
    if (testTouchStart !== null) {
      const diff = testTouchStart - currentX;
      if (diff > 15) {
        triggerHomeTestRight();
      } else if (diff < -15) {
        triggerHomeTestLeft();
      }
    }
  };

  const handleTestTouchEnd = () => {
    if (testTouchStart && testTouchEnd) {
      const distance = testTouchStart - testTouchEnd;
      if (distance > 40) {
        setActiveTestimonialIdx((prev) => (prev + 1) % HOME_VIDEOS.length);
      } else if (distance < -40) {
        setActiveTestimonialIdx((prev) => (prev - 1 + HOME_VIDEOS.length) % HOME_VIDEOS.length);
      }
    }
  };

  // Auto-scroll for Testimonial Videos (pauses on hover or video play)
  useEffect(() => {
    if (isTestimonialHovered || isPlayingVideo) return;
    const timer = setInterval(() => {
      setActiveTestimonialIdx(prev => (prev + 1) % HOME_VIDEOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isTestimonialHovered, isPlayingVideo]);

  useEffect(() => {
    Promise.all([
      servicesAPI.getAll(),
      doctorsAPI.getAll(),
    ]).then(([s, d]) => {
      setServices(s.data?.data || []);
      setDoctors(d.data?.data || []);
    }).catch(() => {
      // Use static fallback data for demo
      setServices(DEMO_SERVICES);
      setDoctors(DEMO_DOCTORS);
    });
  }, []);

  const displayServices = services.length > 0 ? services : DEMO_SERVICES;
  const displayDoctors = doctors.length > 0 ? doctors : DEMO_DOCTORS;

  return (
    <div className="homepage">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__content">
            <div className="hero__text">
              <div className="badge badge-white hero__badge">
                <Sparkles size={14} color="#24E0E1" />
                Dental Excellence
              </div>
              <h1 className="hero__heading">
                <span className="hero__heading-line">Advanced Dentistry</span>
                <span className="hero__heading-accent hero__heading-line" style={{ whiteSpace: 'nowrap' }}>International Standards</span>
                <span className="hero__heading-line">Fraction of a Cost</span>
              </h1>
              <p className="hero__desc">
                Experience gentle, advanced, and affordable dental care designed to keep your smile bright and your life healthier
              </p>
              <div className="hero__actions">
                <button className="btn btn-primary hero__btn-compact" onClick={() => navigate('/online-consultation')}>
                  Book Online Consultation <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                </button>
                <button className="btn btn-secondary hero__btn-compact" onClick={() => navigate('/dental-tourism')}>
                  Info Deck <BookOpen size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                </button>
              </div>
              <div className="hero__stats">
                <StatItem value="5000+" label="Happy Patients" />
                <div className="hero__stat-divider" />
                <StatItem value="15+" label="Expert Doctors" />
                <div className="hero__stat-divider" />
                <StatItem value="10+" label="Years Experience" />
              </div>
            </div>
            {/* ── HERO VISUAL (User HD Dental Tourism Image with 4 Floating Badges) ── */}
            <div className="hero__visual">
              <div className="hero__visual-circle hero__visual-circle--outer" />
              <div className="hero__visual-circle hero__visual-circle--inner" />

              <div className="hero-3d-wrapper hero-3d-wrapper--clickable" onClick={() => navigate('/dental-tourism')}>
                <img
                  src="/assets/hero-3d-tooth.jpg"
                  alt="Kayal Dental Tourism Excellence"
                  className="hero-3d-img"
                />
              </div>

              {/* 4 Animated Floating Badges */}
              <div className="hero__badge-floating hero__badge-floating--tl">
                <Heart size={16} className="text-cyan" fill="#24E0E1" />
                <span>Gentle Care</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--tr">
                <Sparkles size={16} style={{ color: '#24E0E1' }} />
                <span>ModernTech</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--bl">
                <ShieldCheck size={16} style={{ color: '#4ade80' }} />
                <span>Painless Treatment</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--br">
                <Award size={16} style={{ color: '#fbbf24' }} />
                <span>Pure Precision</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE HIGHLIGHTS BAR ── */}
      <section className="highlights">
        <div className="container">
          <div className="highlights__inner highlights__inner--v5">
            {/* 1 - World Class */}
            <div className="highlight-item-v5">
              <div className="highlight-item-v5__icon-wrap-img">
                <Award size={36} className="highlight-item-v5__icon-svg-single" />
              </div>
              <div className="highlight-item-v5__content">
                <h3 className="highlight-item-v5__title" style={{ color: '#350d58' }}>World Class</h3>
                <p className="highlight-item-v5__desc" style={{ color: '#350d58' }}>
                  State-of-the-art dental care using premium Swiss &amp; German materials and technology.
                </p>
              </div>
            </div>

            {/* 2 - Accreditation */}
            <div className="highlight-item-v5">
              <div className="highlight-item-v5__icon-wrap-img">
                <ShieldCheck size={36} className="highlight-item-v5__icon-svg-single" />
              </div>
              <div className="highlight-item-v5__content">
                <h3 className="highlight-item-v5__title" style={{ color: '#350d58' }}>Accreditation</h3>
                <p className="highlight-item-v5__desc" style={{ color: '#350d58' }}>
                  NABH-accredited clinic certified in implantology, orthodontics &amp; oral surgery.
                </p>
              </div>
            </div>

            {/* 3 - Global Expert */}
            <div className="highlight-item-v5">
              <div className="highlight-item-v5__icon-wrap-img">
                <Globe size={36} className="highlight-item-v5__icon-svg-single" />
              </div>
              <div className="highlight-item-v5__content">
                <h3 className="highlight-item-v5__title" style={{ color: '#350d58' }}>Global Expert</h3>
                <p className="highlight-item-v5__desc" style={{ color: '#350d58' }}>
                  Internationally trained specialist surgeons creating confident smiles worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section className="section welcome">
        <div className="container">
          <div className="welcome__grid">
            {/* Left Side: Content */}
            <div className="welcome__content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', alignSelf: 'flex-start' }}>
                About Us
              </div>

              <h2 className="section-title" style={{ marginTop: '1rem', textAlign: 'left' }}>
                <span style={{ color: '#451271' }}>Kayal Dental Tourism</span>
              </h2>
              <p className="welcome__desc" style={{ color: 'var(--gray-600)', marginTop: '1rem', lineHeight: 1.7, textAlign: 'left' }}>
                Experience gentle, patient-focused dentistry designed for your comfort. Our team combines advanced technology with compassionate care to deliver healthy, confident smiles across the globe.
              </p>

              {/* Mission Pill */}
              <div className="welcome__mission-pill" style={{ marginTop: '1.25rem', alignSelf: 'flex-start', marginLeft: 0, marginRight: 'auto' }}>
                <Target size={14} style={{ flexShrink: 0 }} />
                <span>Mission - Creating Smiles Across the Globe.</span>
              </div>

              {/* Vision Pill */}
              <div className="welcome__mission-pill" style={{ marginTop: '0.6rem', alignSelf: 'flex-start', marginLeft: 0, marginRight: 'auto' }}>
                <Eye size={14} style={{ flexShrink: 0 }} />
                <span>Vision - Connecting the World Through Confident Smiles.</span>
              </div>

              {/* Buttons */}
              <div className="welcome__buttons" style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-start', alignSelf: 'flex-start' }}>
                <button className="btn btn-cyan-pill" onClick={() => navigate('/about#facilities')}>
                  Facility &amp; Technology
                </button>
                <button className="btn btn-cyan-pill" onClick={() => navigate('/team')}>
                  Our Dentists <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                </button>
              </div>
            </div>

            {/* Right Side: Founder Image Card */}
            <div>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(69,18,113,0.18)',
                border: '2.5px solid rgba(36,224,225,0.4)',
                position: 'relative'
              }}>
                {/* Tag INSIDE the card (top-left rounded cyan pill) */}
                <div className="founder-card__badge">
                  <Award size={16} color="#451271" />
                  <span>Founder &amp; Chief Dental Surgeon</span>
                </div>

                <img
                  src="/assets/about-doctor-founder.jpeg"
                  alt="Dr. V.Sahaana - Founder &amp; Chief Dental Surgeon"
                  className="founder-card__img"
                />

                {/* Bottom info INSIDE the card */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(36,8,64,0.92) 0%, rgba(36,8,64,0.6) 60%, transparent 100%)',
                  padding: '2rem 1.25rem 1rem',
                  color: '#ffffff'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                    Dr. V.Sahaana, BDS., FDS., FMC.
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#24E0E1', fontWeight: 600, marginTop: '3px', lineHeight: 1.45 }}>
                    <div>Dental surgeon certified</div>
                    <div>Root Canal Specialist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO / TREATMENTS SECTION (Clean Tooth-Only Procedure Images) ── */}
      <section className="what-we-do-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h2 className="what-we-do__title">What We Do</h2>
            <p className="what-we-do__subtitle">Comprehensive dental treatments delivered with world-class international standards.</p>
          </div>

          <div className="treatments-vertical-grid">
            {ALL_TREATMENTS.map((item, index) => (
              <motion.div
                key={index}
                className="treatment-card-v"
                onClick={() => navigate(`/services/${item.slug}`)}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.12 }}
                whileHover={{ y: -10 }}
              >
                <div className="treatment-card-v__img-box">
                  <img src={item.img} alt={item.title} className="treatment-card-v__img" loading="lazy" decoding="async" />
                </div>
                <div className="treatment-card-v__body">
                  <h3 className="treatment-card-v__title">{item.title}</h3>
                  <p className="treatment-card-v__desc">{item.desc}</p>
                  <div className="treatment-card-v__footer">
                    <span>Learn More</span>
                    <ArrowRight size={15} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} className="treatment-card-v__arrow" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile View: Single Row Sliding Carousel with Directional Manual Arrow Buttons */}
          <div className="what-we-do-mobile-slider">
            <div className="what-we-do-slider-container" onWheel={handleTreatWheel}>
              {/* Left Arrow Button – shows strictly on manual left swipe/wheel */}
              <button
                type="button"
                className={`what-we-do-slider__arrow what-we-do-slider__arrow--prev ${showTreatLeft ? 'is-visible' : ''}`}
                onClick={(e) => {
                  setWhatWeDoIdx(prev => (prev - 1 + ALL_TREATMENTS.length) % ALL_TREATMENTS.length);
                  triggerTreatLeft();
                  e.currentTarget.blur();
                }}
                aria-label="Previous Treatment Card"
              >
                <ChevronLeft size={24} strokeWidth={2.8} />
              </button>

              {/* Sliding Card Wrap with Touch Swipe Support */}
              <div
                className="what-we-do-slider__track"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="treatment-card-v what-we-do-slider__card"
                  onClick={() => navigate(`/services/${ALL_TREATMENTS[whatWeDoIdx].slug}`)}
                >
                  <div className="treatment-card-v__img-box">
                    <img
                      src={ALL_TREATMENTS[whatWeDoIdx].img}
                      alt={ALL_TREATMENTS[whatWeDoIdx].title}
                      className="treatment-card-v__img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="treatment-card-v__body">
                    <h3 className="treatment-card-v__title">{ALL_TREATMENTS[whatWeDoIdx].title}</h3>
                    <p className="treatment-card-v__desc">{ALL_TREATMENTS[whatWeDoIdx].desc}</p>
                    <div className="treatment-card-v__footer">
                      <span>Learn More</span>
                      <ArrowRight size={15} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} className="treatment-card-v__arrow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Arrow Button – shows strictly on manual right swipe/wheel */}
              <button
                type="button"
                className={`what-we-do-slider__arrow what-we-do-slider__arrow--next ${showTreatRight ? 'is-visible' : ''}`}
                onClick={(e) => {
                  setWhatWeDoIdx(prev => (prev + 1) % ALL_TREATMENTS.length);
                  triggerTreatRight();
                  e.currentTarget.blur();
                }}
                aria-label="Next Treatment Card"
              >
                <ChevronRight size={24} strokeWidth={2.8} />
              </button>
            </div>

            {/* Indicator Dots */}
            <div className="what-we-do-slider__dots">
              {ALL_TREATMENTS.map((_, i) => (
                <button
                  key={i}
                  className={`what-we-do-slider__dot ${i === whatWeDoIdx ? 'what-we-do-slider__dot--active' : ''}`}
                  onClick={(e) => { setWhatWeDoIdx(i); e.currentTarget.blur(); }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY INDIA FOR DENTAL CARE SECTION (Section 5) ── */}
      <section className="section why-us-v4" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="why-us-v4__grid">
            {/* Left Column: Real Clinic Doctor Checkup Photo Visual */}
            <div className="why-us-v4__visual">
              <div className="why-us-v4__img-box" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(69,18,113,0.18)', border: '2.5px solid rgba(36,224,225,0.4)', background: '#ffffff', cursor: 'pointer' }} onClick={() => navigate('/dental-tourism')}>
                <img
                  src="/assets/why-india-doctor-checkup.jpg"
                  alt="Why India for Dental Care - Incredible India"
                  className="why-us-v4__doc-img"
                  loading="lazy"
                  decoding="async"
                  style={{ borderRadius: '24px', width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>

            {/* Right Column: Single Line Heading + Content + 2 Button Rows */}
            <div className="why-us-v4__content">
              <h2 className="why-us-v4__title" style={{ fontSize: 'clamp(20px, 2.7vw, 34px)', letterSpacing: '0.02em' }}>
                Why India for Dental Care?
              </h2>
              <h3 className="why-us-v4__subtitle">World-Class Treatments at 70% Lower Cost</h3>
              <p className="why-us-v4__desc">
                India is the leading destination for dental tourism. At Kayal Dental Care, we combine internationally trained specialists, advanced digital technology, and sterile hospital standards to deliver premium care.
              </p>

              {/* Action Buttons: Desktop = 2 Pills + CTA Button, Mobile = 2 Side-by-Side Pills + CTA */}
              <div className="why-us-v4__cta-column" style={{ marginTop: '1.75rem' }}>
                <div className="why-us-v4__pills">
                  <div className="why-us-v4__pill" onClick={() => navigate('/dental-tourism#journey')} style={{ cursor: 'pointer' }}>
                    Patient Journey
                  </div>
                  <div className="why-us-v4__pill" onClick={() => navigate('/dental-tourism#safety')} style={{ cursor: 'pointer' }}>
                    Quality &amp; Safety
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <button className="why-us-v4__cta-btn" onClick={() => navigate('/online-consultation')}>
                    <span>Book Online Consultation</span>
                    <ArrowRight size={18} color="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff', flexShrink: 0 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (CARD TYPE WITH VIDEOS & SLIDER) ── */}
      <section className="testimonials-v3-section" style={{ padding: '3rem 1.5rem', background: '#ffffff' }}>
        <div className="container">
          <div className="testimonials-v3__inner">
            {/* Left Column: Heading & Paragraph */}
            <div className="testimonials-v3__left">
              <h2 style={{ fontFamily: 'Comfortaa', fontSize: 'clamp(32px, 3.5vw, 44px)', fontWeight: 800, color: '#350d58', letterSpacing: '0.02em', margin: 0, lineHeight: 1.2 }}>
                Testimonials
              </h2>
              <h3 style={{ fontFamily: 'Comfortaa', fontSize: '20px', fontWeight: 600, color: '#350d58', marginTop: '0.75rem', marginBottom: '1rem' }}>
                What Our Happy Patients Say Here
              </h3>
              <p style={{ fontFamily: 'Comfortaa', fontSize: '17px', color: '#350d58', lineHeight: 1.65, margin: 0 }}>
                Discover real stories from patients who trusted us with their smiles and left happier than ever.
              </p>
              <div style={{ marginTop: '1.75rem' }}>
                <button className="btn btn-purple" onClick={() => navigate('/testimonials')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  View All Reviews <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                </button>
              </div>
            </div>

            {/* Right Column: Auto-sliding Video Cards with Side Arrows */}
            <div
              className="testimonials-v3__slider-wrap"
              onMouseEnter={() => setIsTestimonialHovered(true)}
              onMouseLeave={() => setIsTestimonialHovered(false)}
            >
              <div
                className="testimonials-v3__cards-container"
                onWheel={handleTestWheel}
                onTouchStart={handleTestTouchStart}
                onTouchMove={handleTestTouchMove}
                onTouchEnd={handleTestTouchEnd}
              >
                {/* Left Sliding Icon – strictly on left manual scroll/swipe */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTestimonialIdx((prev) => (prev - 1 + HOME_VIDEOS.length) % HOME_VIDEOS.length);
                    triggerHomeTestLeft();
                  }}
                  className={`testimonials-v3__arrow-btn testimonials-v3__arrow-btn--prev ${showHomeTestLeft ? 'is-visible' : ''}`}
                  aria-label="Previous Testimonial Video"
                >
                  <ChevronLeft size={25} strokeWidth={2.8} />
                </button>

                {/* Right Sliding Icon – strictly on right manual scroll/swipe */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTestimonialIdx((prev) => (prev + 1) % HOME_VIDEOS.length);
                    triggerHomeTestRight();
                  }}
                  className={`testimonials-v3__arrow-btn testimonials-v3__arrow-btn--next ${showHomeTestRight ? 'is-visible' : ''}`}
                  aria-label="Next Testimonial Video"
                >
                  <ChevronRight size={25} strokeWidth={2.8} />
                </button>

                {/* Cards Grid */}
                <div className="testimonials-v3__cards-grid">
                  {(isMobileScreen ? [0] : [0, 1]).map((offset) => {
                    const itemIndex = (activeTestimonialIdx + offset) % HOME_VIDEOS.length;
                    const item = HOME_VIDEOS[itemIndex];
                    return (
                      <motion.div
                        key={`${itemIndex}-${offset}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={`testimonials-v3__card ${offset === 1 ? 'testimonials-v3__card--desktop-only' : ''}`}
                      >
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '14px', overflow: 'hidden', background: '#000000', marginBottom: '0.85rem' }}>
                          <video
                            src={item.videoSrc}
                            controls
                            playsInline
                            preload="metadata"
                            onPlay={() => setIsPlayingVideo(true)}
                            onPause={() => setIsPlayingVideo(false)}
                            onEnded={() => setIsPlayingVideo(false)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                            {Array.from({ length: item.stars }).map((_, j) => (
                              <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          <span style={{ fontSize: '0.70rem', fontWeight: 600, background: '#24E0E1', color: '#350d58', padding: '0.2rem 0.55rem', borderRadius: '50px', whiteSpace: 'nowrap', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {item.tag}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Comfortaa', fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                            {item.name}
                          </div>
                          <div style={{ fontFamily: 'Comfortaa', fontSize: '0.78rem', color: '#24E0E1', marginTop: '2px' }}>
                            {item.location}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Slider Dots */}
              <div className="testimonials-v3__dots">
                {HOME_VIDEOS.map((_, i) => (
                  <button
                    key={i}
                    className={`testimonials-v3__dot ${i === activeTestimonialIdx ? 'testimonials-v3__dot--active' : ''}`}
                    onClick={(e) => { setActiveTestimonialIdx(i); e.currentTarget.blur(); }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERNATIONAL PATIENT TRAVEL DESK (Image-Rich Step Cards) ── */}
      <section className="section travel-home-section" style={{ background: '#f8fafc', padding: '4.5rem 0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
              Global Dental Tourism Deck
            </div>
            <h2 className="section-title" style={{ color: '#451271', fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 800 }}>
              Your Dental Vacation in 4 Simple Steps
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--gray-600)', maxWidth: '750px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
              Relax while our dedicated international team manages your visa invitation, private airport pickup, hotel stay, and guided sightseeing.
            </p>
          </div>

          {/* 4 Image-Rich Step Cards */}
          <div className="travel-timeline">
            {/* Step 1: Online Consultation & E-Visa */}
            <motion.div
              className="travel-step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate('/online-consultation')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-1-evisa.png" alt="Online Consultation & E-Visa" className="travel-step-card__top-img" loading="lazy" decoding="async" />
                <div className="travel-step-card__num">01</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title">1. Online Consultation &amp; E-Visa</h3>
                <p className="travel-step-card__desc">
                  Receive your customized treatment plan &amp; official Indian E-Medical Visa invitation letter within 24 hours.
                </p>
                <span className="travel-step-card__tag">Fast 24h Letter</span>
              </div>
            </motion.div>

            {/* Step 2: Airport Pickup & Hotel */}
            <motion.div
              className="travel-step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate('/patient-resources#pickup')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-2-airport.jpg" alt="VIP Airport Pickup & Hotel Stay" className="travel-step-card__top-img" loading="lazy" decoding="async" />
                <div className="travel-step-card__num">02</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title">2. Airport Pickup &amp; Hotel</h3>
                <p className="travel-step-card__desc">
                  Complimentary private AC chauffeur greets you at airport &amp; escorts you to <span style={{ whiteSpace: 'nowrap' }}>partner 3★ - 5★ hotels.</span>
                </p>
                <span className="travel-step-card__tag">100% Free Transfer</span>
              </div>
            </motion.div>

            {/* Step 3: World-Class Dental Care */}
            <motion.div
              className="travel-step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate('/services')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-3-care.png" alt="World-Class Dental Care" className="travel-step-card__top-img" loading="lazy" decoding="async" />
                <div className="travel-step-card__num">03</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title">3. World-Class Dental Care</h3>
                <p className="travel-step-card__desc">
                  Painless procedures performed by certified specialists using Swiss &amp; German premium materials.
                </p>
                <span className="travel-step-card__tag">70% Cost Savings</span>
              </div>
            </motion.div>

            {/* Step 4: Vacation & Recovery */}
            <motion.div
              className="travel-step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate('/patient-resources#tips')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-4-adiyogi.png" alt="Vacation & Sightseeing Recovery" className="travel-step-card__top-img" loading="lazy" decoding="async" />
                <div className="travel-step-card__num">04</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title">4. Vacation &amp; Sightseeing</h3>
                <p className="travel-step-card__desc">
                  Recover while exploring serene beach resorts, historic temples, and local shopping landmarks.
                </p>
                <span className="travel-step-card__tag">Vacation &amp; Recovery</span>
              </div>
            </motion.div>
          </div>

          {/* Travel Concierge Banner */}
          <div className="travel-concierge-banner" style={{ marginTop: '3.5rem' }}>
            <div className="travel-concierge-banner__inner">
              <div className="travel-concierge-banner__text">
                <h3 className="travel-concierge-banner__title">Need Assistance Planning<br className="need-title-br" /> Your Dental Trip?</h3>
                <p className="travel-concierge-banner__desc">Our dedicated Patient Concierge handles flight dates, hotel bookings, and custom treatment schedules for free.</p>
              </div>
              <div className="travel-concierge-banner__actions">
                <button className="btn btn-cyan-pill" onClick={() => navigate('/patient-resources#visa')}>
                  Plan My Dental Trip <ArrowRight size={16} />
                </button>
                <a
                  href="https://wa.me/917867926159?text=Hi%20Kayal%20Dental%20Care%2C%20I%20would%20like%20to%20plan%20my%20dental%20trip."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-purple"
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <WhatsAppIcon size={18} color="#ffffff" />
                  <span className="hide-mobile">WhatsApp Travel Deck ↗</span>
                  <span className="show-mobile">WhatsApp ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Modal */}
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} services={displayServices} doctors={displayDoctors} />}
    </div>
  );
};

// ─── Static Demo Data (shown when API is unavailable) ──────────────────────

const DEMO_SERVICES: Service[] = [
  { _id: '1', name: 'Teeth Alignment', slug: 'teeth-alignment', shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '2', name: 'Teeth Replacement', slug: 'teeth-replacement', shortDescription: 'Restore missing teeth with comfortable and natural-looking solutions.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '3', name: 'Smile Designing', slug: 'smile-designing', shortDescription: 'Enhance your smile with personalized cosmetic dental treatments.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '4', name: 'Dental Implants', slug: 'dental-implants', shortDescription: 'Restore missing teeth with permanent titanium implants.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '5', name: 'Root Canal Treatment', slug: 'root-canal-treatment', shortDescription: 'Save infected teeth with painless modern root canal therapy.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '6', name: 'Teeth Whitening', slug: 'teeth-whitening', shortDescription: 'Brighten your smile with professional whitening treatments.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '7', name: 'Braces', slug: 'braces', shortDescription: 'Traditional and ceramic braces for effective teeth straightening.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '8', name: 'Pediatric Dentistry', slug: 'pediatric-dentistry', shortDescription: 'Gentle dental care specially designed for children.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
];





const DEMO_DOCTORS: Doctor[] = [
  { _id: '1', name: 'Dr. Priya Sharma', qualification: 'BDS, MDS', specialization: 'General & Cosmetic Dentist', experience: 12, image: '', description: '', availability: [], status: 'active', createdAt: '' },
  { _id: '2', name: 'Dr. Ramesh Kumar', qualification: 'BDS, MDS (Orthodontics)', specialization: 'Orthodontist', experience: 10, image: '', description: '', availability: [], status: 'active', createdAt: '' },
  { _id: '3', name: 'Dr. Anitha Rao', qualification: 'BDS, MDS (Implantology)', specialization: 'Implantologist', experience: 8, image: '', description: '', availability: [], status: 'active', createdAt: '' },
  { _id: '4', name: 'Dr. Karthik Nair', qualification: 'BDS, MDS (Pediatric)', specialization: 'Pediatric Dentist', experience: 7, image: '', description: '', availability: [], status: 'active', createdAt: '' },
];

export default HomePage;
