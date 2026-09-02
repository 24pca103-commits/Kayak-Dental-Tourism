import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Globe, Heart, Sparkles, Plane, Award, ShieldCheck
} from 'lucide-react';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';

import './HomePage.css';

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
    img: '/assets/treatment-1-implants.png',
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
    img: '/assets/treatment-6-orthodontics.jpg',
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
    img: '/assets/treatment-8-pediatric.jpg',
  },
];

/* ═══════════════ HOME PAGE ═══════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);

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
                <Sparkles size={14} />
                Dental Excellence
              </div>
              <h1 className="hero__heading">
                Advanced Dentistry<br />
                <span className="hero__heading-accent" style={{ whiteSpace: 'nowrap' }}>International Standards</span><br />
                Fraction of a Cost
              </h1>
              <p className="hero__desc">
                Experience world-class dental care at Kayal Multispeciality Dental — trusted by 5,000+ international patients from 20+ countries.
              </p>
              <div className="hero__actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/online-consultation')}>
                  Book Online Consultation <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dental-tourism')}>
                  World Desk <Globe size={16} />
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
                  src="/assets/hero-dental-tourism-hd.jpg"
                  alt="Kayal Dental Tourism Excellence"
                  className="hero-3d-img"
                />
                <div className="hero-flight-badge-overlay">
                  <Plane size={20} className="hero-flight-icon" />
                  <span>Fly for Your Perfect Smile ↗</span>
                </div>
              </div>

              {/* 4 Animated Floating Badges */}
              <div className="hero__badge-floating hero__badge-floating--tl">
                <Heart size={16} className="text-cyan" fill="#24E0E1" />
                <span>Gentle Care</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--tr">
                <Sparkles size={16} style={{ color: '#24E0E1' }} />
                <span>SmileTech</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--bl">
                <Globe size={16} className="text-cyan" />
                <span>Global Care</span>
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
                <h3 className="highlight-item-v5__title">World Class</h3>
                <p className="highlight-item-v5__desc">
                  State-of-the-art dental care using premium international Swiss &amp; German materials.
                </p>
              </div>
            </div>

            {/* 2 - Accreditation (Normal Icon - No Blinking) */}
            <div className="highlight-item-v5">
              <div className="highlight-item-v5__icon-wrap-img">
                <ShieldCheck size={36} className="highlight-item-v5__icon-svg-single" />
              </div>
              <div className="highlight-item-v5__content">
                <h3 className="highlight-item-v5__title">Accreditation</h3>
                <p className="highlight-item-v5__desc">
                  ISO 9001 &amp; NABH certified facility following strict international safety protocols.
                </p>
              </div>
            </div>

            {/* 3 - Global Expert */}
            <div className="highlight-item-v5">
              <div className="highlight-item-v5__icon-wrap-img">
                <Globe size={36} className="highlight-item-v5__icon-svg-single" />
              </div>
              <div className="highlight-item-v5__content">
                <h3 className="highlight-item-v5__title">Global Expert</h3>
                <p className="highlight-item-v5__desc">
                  Internationally trained specialist surgeons creating confident smiles worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION (Section 3: Single Line Mission & Full Width Visual) ── */}
      <section className="section welcome">
        <div className="container">
          <div className="welcome__grid">
            {/* Left Side: Content */}
            <div className="welcome__text">
              <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
                About Us
              </div>

              {/* Non-actionable Mission Pill/Banner (Enforced Single Line) */}
              <div className="welcome__mission-pill" style={{ whiteSpace: 'nowrap' }}>
                <Globe size={16} />
                <span>About Kayal Dental Tourism : Mission - Creating Smiles Across the Globe.</span>
              </div>

              <h2 className="section-title" style={{ marginTop: '1rem' }}>
                <span style={{ color: '#451271' }}>Kayal Multispeciality<br />Dental Care</span>
              </h2>
              <p style={{ color: 'var(--gray-600)', marginTop: '1rem', lineHeight: 1.8, fontSize: '18px' }}>
                Experience gentle, patient-focused dentistry designed for your comfort. Our team combines advanced technology with compassionate care to deliver healthy, confident smiles across the globe.
              </p>

              {/* 2 Cyan Pill Buttons: Facility & Technology first, Our Dentists second */}
              <div className="welcome__actions-row" style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-cyan-pill" onClick={() => navigate('/about')}>
                  Facility &amp; Technology
                </button>
                <button className="btn btn-cyan-pill" onClick={() => navigate('/team')}>
                  Our Dentists <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Side: Image (Expanded to fill right column cleanly) */}
            <div className="welcome__visual" style={{ width: '100%' }}>
              <div
                className="welcome__img-wrap-v4 welcome__img-wrap--clickable"
                onClick={() => navigate('/dental-tourism')}
                title="Click to explore Dental Tourism"
                style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(69,18,113,0.18)', border: '2.5px solid rgba(36,224,225,0.4)', background: '#ffffff', cursor: 'pointer', width: '100%' }}
              >
                <img
                  src="/assets/dental-tourism-resort-hd.jpg"
                  alt="Kayal Dental Tourism Resort & Care"
                  className="welcome__3d-img"
                  style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO / TREATMENTS SECTION (Clean Tooth-Only Procedure Images) ── */}
      <section className="what-we-do-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h2 className="what-we-do__title">WHAT WE DO</h2>
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
                  <img src={item.img} alt={item.title} className="treatment-card-v__img" />
                </div>
                <div className="treatment-card-v__body">
                  <h3 className="treatment-card-v__title">{item.title}</h3>
                  <p className="treatment-card-v__desc">{item.desc}</p>
                  <div className="treatment-card-v__footer">
                    <span>Learn More</span>
                    <ArrowRight size={15} className="treatment-card-v__arrow" />
                  </div>
                </div>
              </motion.div>
            ))}
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
                  alt="Why India for Dental Care - Expert Dentist Checkup"
                  className="why-us-v4__doc-img"
                  style={{ borderRadius: '24px', width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Right Column: Single Line Heading + Content + 2 Button Rows */}
            <div className="why-us-v4__content">
              <h2 className="why-us-v4__title" style={{ whiteSpace: 'nowrap', fontSize: 'clamp(20px, 2.7vw, 34px)', letterSpacing: '0.02em' }}>
                WHY INDIA FOR DENTAL CARE
              </h2>
              <h3 className="why-us-v4__subtitle">World-class treatments at 70% lower cost</h3>
              <p className="why-us-v4__desc">
                India is the leading destination for dental tourism. At Kayal Dental Care, we combine internationally trained specialists, advanced digital technology, and sterile hospital standards to deliver premium care.
              </p>

              {/* Action Buttons: Line 1 = Patient Journey & Quality & Safety, Line 2 = Book Online Consultation */}
              <div className="why-us-v4__cta-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.75rem' }}>
                <div className="why-us-v4__cta-row-pills" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap' }}>
                  <button className="btn btn-cyan-pill" onClick={() => navigate('/dental-tourism')}>
                    Patient Journey
                  </button>
                  <button className="btn btn-cyan-pill" onClick={() => navigate('/about')}>
                    Quality &amp; Safety
                  </button>
                </div>
                <div>
                  <button className="btn btn-purple" onClick={() => navigate('/online-consultation')}>
                    Book Online Consultation <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-v3-section" style={{ padding: '3rem 1.5rem', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div className="testimonials-v3__inner" style={{ background: '#24E0E1', borderRadius: '28px', padding: '3rem 2.5rem', display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '2.5rem', alignItems: 'center' }}>
            {/* Left Column: Heading & Paragraph */}
            <div className="testimonials-v3__left">
              <h2 style={{ fontFamily: 'Comfortaa', fontSize: 'clamp(32px, 3.5vw, 44px)', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0, lineHeight: 1.2 }}>
                TESTIMONIALS
              </h2>
              <h3 style={{ fontFamily: 'Comfortaa', fontSize: '20px', fontWeight: 600, color: '#ffffff', marginTop: '0.75rem', marginBottom: '1rem' }}>
                What our happy patients say here
              </h3>
              <p style={{ fontFamily: 'Comfortaa', fontSize: '17px', color: '#ffffff', lineHeight: 1.65, opacity: 0.95, margin: 0 }}>
                Discover real stories from patients who trusted us with their smiles and left happier than ever.
              </p>
            </div>

            {/* Right Column: 2 Parallel Dark Purple Testimonial Cards */}
            <div className="testimonials-v3__cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="testimonials-v3__card" style={{ background: '#451271', borderRadius: '24px', padding: '2.5rem 2.25rem', color: '#ffffff', boxShadow: '0 12px 35px rgba(69,18,113,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
                <p style={{ fontFamily: 'Comfortaa', fontSize: '16px', lineHeight: 1.75, color: 'rgba(255,255,255,0.92)', fontStyle: 'normal', margin: 0 }}>
                  "I visited KAYAL Multispecialty Dental Care for teeth replacement, and I am extremely happy with the treatment. The clinic is very clean, modern, and equipped with the latest technology. The doctors are patient, friendly, and truly care about your comfort. I finally have the confidence to smile again!"
                </p>
                <span style={{ fontFamily: 'Comfortaa', fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '1.5rem', display: 'block' }}>
                  — Priya S.
                </span>
              </div>

              <div className="testimonials-v3__card" style={{ background: '#451271', borderRadius: '24px', padding: '2.5rem 2.25rem', color: '#ffffff', boxShadow: '0 12px 35px rgba(69,18,113,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
                <p style={{ fontFamily: 'Comfortaa', fontSize: '16px', lineHeight: 1.75, color: 'rgba(255,255,255,0.92)', fontStyle: 'normal', margin: 0 }}>
                  "KAYAL Dental Care made me feel comfortable from the moment I walked in. The doctors explained every step clearly, and my smile makeover result was better than I expected. Thank you for the wonderful experience!"
                </p>
                <span style={{ fontFamily: 'Comfortaa', fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '1.5rem', display: 'block' }}>
                  — Karthik R.
                </span>
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
              Global Dental Tourism Desk
            </div>
            <h2 className="section-title" style={{ color: '#451271', fontSize: 'clamp(30px, 3.5vw, 42px)', fontWeight: 800 }}>
              YOUR DENTAL VACATION IN 4 SIMPLE STEPS
            </h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '18px', maxWidth: '750px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
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
              onClick={() => navigate('/travel-visa')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-1-evisa.png" alt="Online Consultation & E-Visa" className="travel-step-card__top-img" />
                <div className="travel-step-card__num">01</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title" style={{ whiteSpace: 'nowrap' }}>1. Online Consult &amp; E-Visa</h3>
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
              onClick={() => navigate('/travel-visa')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-2-airport.jpg" alt="VIP Airport Pickup & Hotel Stay" className="travel-step-card__top-img" />
                <div className="travel-step-card__num">02</div>
              </div>
              <div className="travel-step-card__content">
                <h3 className="travel-step-card__title">2. Airport Pickup &amp; Hotel</h3>
                <p className="travel-step-card__desc">
                  Complimentary private AC chauffeur greets you at airport &amp; escorts you to partner 3★–5★ hotels.
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
              onClick={() => navigate('/travel-visa')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-3-care.png" alt="World-Class Dental Care" className="travel-step-card__top-img" />
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
              onClick={() => navigate('/travel-visa')}
            >
              <div className="travel-step-card__img-header">
                <img src="/assets/travel-step-4-resort.jpg" alt="Vacation & Sightseeing Recovery" className="travel-step-card__top-img" />
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
                <h3 className="travel-concierge-banner__title">Need Assistance Planning Your Dental Trip?</h3>
                <p className="travel-concierge-banner__desc">Our dedicated Patient Concierge handles flight dates, hotel bookings, and custom treatment schedules for free.</p>
              </div>
              <div className="travel-concierge-banner__actions">
                <button className="btn btn-cyan-pill" onClick={() => navigate('/travel-visa')}>
                  Plan My Dental Trip <ArrowRight size={16} />
                </button>
                <a
                  href="https://wa.me/919876543210?text=Hello%20Kayal%20Dental%20Care,%20I%20need%20help%20planning%20my%20dental%20travel."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-purple"
                  style={{ background: '#22c55e', borderColor: '#22c55e', color: '#ffffff' }}
                >
                  WhatsApp Travel Desk ↗
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
