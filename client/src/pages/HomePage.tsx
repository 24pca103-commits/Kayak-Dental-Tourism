import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, CheckCircle, Activity
} from 'lucide-react';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';
import toothVideo from '../assets/34.mp4';
import './HomePage.css';

/* ── Stat counter ── */
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="hero-stat">
    <span className="hero-stat__value">{value}</span>
    <span className="hero-stat__label">{label}</span>
  </div>
);


/* ═══════════════ HOME PAGE ═══════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
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
                <Activity size={12} />
                Advanced Dental Care
              </div>
              <h1 className="hero__heading">
                Healthy Teeth<br />
                <span className="hero__heading-accent">Happy Life</span><br />
                Start Here
              </h1>
              <p className="hero__desc">
                Experience gentle, advanced, and affordable dental care designed to keep your smile bright and your life healthier.
              </p>
              <div className="hero__actions">
                <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                  Book Appointment <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate('/services')}>
                  Our Services
                </button>
              </div>
              <div className="hero__stats">
                <StatItem value="5000+" label="Happy Patients" />
                <div className="hero__stat-divider" />
                <StatItem value="10+" label="Expert Doctors" />
                <div className="hero__stat-divider" />
                <StatItem value="15+" label="Years Experience" />
              </div>
            </div>
            {/* ── HERO VISUAL (3D Tooth image from Image 3) ── */}
            <div className="hero__visual">
              <div className="hero__visual-circle hero__visual-circle--outer" />
              <div className="hero__visual-circle hero__visual-circle--inner" />
              
              <div className="hero-3d-wrapper">
                <img
                  src="/assets/hero-3d-tooth.jpg"
                  alt="3D Dental Treatment"
                  className="hero-3d-img"
                />
              </div>

              {/* Floating Badges from Image 2 */}
              <div className="hero__badge-floating hero__badge-floating--tl">
                <CheckCircle size={16} className="text-green" />
                <span>Pain-Free Dentistry</span>
              </div>
              <div className="hero__badge-floating hero__badge-floating--br">
                <Star size={16} fill="currentColor" style={{ color: '#fbbf24' }} />
                <span>5-Star Rated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE HIGHLIGHTS BAR (Animated Tooth Video) ── */}
      <section className="highlights">
        <div className="container">
          <div className="highlights__inner highlights__inner--v5">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="highlight-item-v5">
                <div className="highlight-item-v5__icon">
                  <video
                    src={toothVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    className="highlight-item-v5__video"
                  />
                </div>
                <div className="highlight-item-v5__content">
                  <h3 className="highlight-item-v5__title">Dental Implants</h3>
                  <p className="highlight-item-v5__desc">
                    Dental implants are the closest you can get to healthy, beautiful and natural teeth.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WELCOME / ABOUT SECTION (Flipped Layout: Left Content, Right Image) ── */}
      <section className="section welcome">
        <div className="container">
          <div className="welcome__grid">
            {/* Left Side: Content */}
            <div className="welcome__text">
              <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
                About Us
              </div>
              <h2 className="section-title">
                Welcome to<br />
                <span style={{ color: '#451271' }}>Kayal Multispeciality<br />Dental Care</span>
              </h2>
              <p style={{ color: 'var(--gray-600)', marginTop: '1.25rem', lineHeight: 1.8, fontSize: '19px' }}>
                Experience gentle, patient-focused dentistry designed for your comfort. Our team combines advanced technology with compassionate care to deliver healthy, confident smiles for every family.
              </p>
              <div className="welcome__tags" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {['Digital X-Ray', 'Expert Specialists', 'Advanced Sterilization', 'Emergency Care'].map((tag) => (
                  <span key={tag} className="welcome__tag-cyan-pill">{tag}</span>
                ))}
              </div>
            </div>

            {/* Right Side: Image (Image 4: White background 3D Tooth composition) */}
            <div className="welcome__visual">
              <div className="welcome__img-wrap-v4">
                <img
                  src="/assets/about-3d-tooth.jpg"
                  alt="Kayal Dental Care Facilities"
                  className="welcome__3d-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO SECTION (Pure Vector Design Component) ── */}
      <section className="what-we-do-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h2 className="what-we-do__title">WHAT WE DO</h2>
            <p className="what-we-do__subtitle">Short, crisp, professional — modern dental clinic tone.</p>
          </div>
          <div className="what-we-do__grid">
            {/* Card 1: Teeth Alignment */}
            <div className="what-we-do__card">
              <div className="what-we-do__card-img-wrap">
                <img src="/assets/what-we-do-braces.png" alt="Teeth Alignment" className="what-we-do__card-img" />
              </div>
              <div className="what-we-do__card-body">
                <h3 className="what-we-do__card-title">Teeth Alignment</h3>
                <p className="what-we-do__card-desc">
                  Correct misaligned teeth with braces or clear aligners for a balanced, confident smile.
                </p>
              </div>
            </div>

            {/* Card 2: Teeth Replacement */}
            <div className="what-we-do__card">
              <div className="what-we-do__card-img-wrap">
                <img src="/assets/what-we-do-replacement.png" alt="Teeth Replacement" className="what-we-do__card-img" />
              </div>
              <div className="what-we-do__card-body">
                <h3 className="what-we-do__card-title">Teeth Replacement</h3>
                <p className="what-we-do__card-desc">
                  Restore missing teeth using crowns, bridges, dentures, or advanced dental implants.
                </p>
              </div>
            </div>

            {/* Card 3: Smile Designing */}
            <div className="what-we-do__card">
              <div className="what-we-do__card-img-wrap">
                <img src="/assets/what-we-do-smile.png" alt="Smile Designing" className="what-we-do__card-img" />
              </div>
              <div className="what-we-do__card-body">
                <h3 className="what-we-do__card-title">Smile Designing</h3>
                <p className="what-we-do__card-desc">
                  Transform your smile using cosmetic procedures such as veneers, whitening, and reshaping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US SECTION (Pure Vector Design Component) ── */}
      <section className="section why-us-v4" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="why-us-v4__grid">
            {/* Left Column: Real Doctor Image + Circular Badge */}
            <div className="why-us-v4__visual">
              <div className="why-us-v4__img-box">
                <img src="/assets/why-us-doctor-real.jpg" alt="Kayal Dental Specialist" className="why-us-v4__doc-img" style={{ borderRadius: '24px', width: '100%', height: 'auto', objectFit: 'contain' }} />
                {/* 15+ Years Experience Circular Badge */}
                <div className="why-us-v4__circle-badge">
                  <svg viewBox="0 0 140 140" fill="none" className="why-us-v4__badge-svg">
                    <circle cx="70" cy="70" r="66" fill="#24E0E1" />
                    <circle cx="70" cy="70" r="46" fill="#451271" />
                    {/* Badge Inner Logo & Text */}
                    <text x="70" y="62" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="Comfortaa">KAYAL</text>
                    <text x="70" y="74" fill="#24E0E1" fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="Comfortaa">DENTAL CARE</text>
                    <text x="70" y="90" fill="#ffffff" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Comfortaa">15+ YEARS</text>
                    <text x="70" y="100" fill="#ffffff" fontSize="7" fontWeight="500" textAnchor="middle" fontFamily="Comfortaa">EXPERIENCE</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Content + 4 Cyan Pills + Purple CTA */}
            <div className="why-us-v4__content">
              <h2 className="why-us-v4__title">WHY CHOOSE US</h2>
              <h3 className="why-us-v4__subtitle">Your trusted dental partner for every family member</h3>
              <p className="why-us-v4__desc">
                We offer complete dental care for patients of all ages — from children to seniors — ensuring healthy, confident smiles for your entire family. With experienced specialists, modern technology, and a caring approach, we make every visit comfortable and reassuring.
              </p>

              {/* 4 Cyan Pill Buttons */}
              <div className="why-us-v4__pills">
                <span className="why-us-v4__pill">Friendly Environment</span>
                <span className="why-us-v4__pill">Experienced Dental</span>
                <span className="why-us-v4__pill">Personalized Patient care</span>
                <span className="why-us-v4__pill">Pain-Free Dentistry</span>
              </div>

              {/* Purple Book An Appointment Button */}
              <button className="btn why-us-v4__cta-btn" onClick={() => setShowModal(true)}>
                Book An Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Matching Image 3 Layout) ── */}
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

      {/* ── FREQUENTLY ASKED QUESTIONS (Matching Image 3 Layout) ── */}
      <section className="section faq-section-v3" style={{ background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1280px', padding: '0 2rem' }}>
          <div className="faq-v3__grid">
            {/* Left Column: 3D Tooth + Question Mark Image & Title */}
            <div className="faq-v3__left">
              <div className="faq-v3__img-wrap">
                <img src="/assets/faq-tooth-q.png" alt="Frequently Asked Questions" className="faq-v3__tooth-img" />
              </div>
              <h2 className="faq-v3__title">
                FREQUENTLY<br />
                ASKED<br />
                QUESTIONS
              </h2>
            </div>

            {/* Right Column: Light Cyan Accordion Box List */}
            <div className="faq-v3__accordion-list">
              {[
                { id: '1', num: '1.', question: 'How often should I visit the dentist?', answer: 'We recommend a dental check-up every 6 months to maintain healthy teeth and gums.' },
                { id: '2', num: '2.', question: 'Do dental treatments cause pain?', answer: 'Most treatments are performed using modern techniques and appropriate anesthesia to ensure complete patient comfort.' },
                { id: '3', num: '3.', question: 'Do you offer braces and clear aligners?', answer: 'Yes. We provide comprehensive orthodontic solutions including traditional braces and invisible clear aligners based on individual needs.' },
                { id: '4', num: '4.', question: 'How long does a dental implant procedure take?', answer: 'Implants typically take 2-4 months depending on healing, with temporary crowns provided during the process.' },
                { id: '5', num: '5.', question: 'Is teeth whitening safe?', answer: 'Professional teeth whitening under dental supervision is 100% safe, effective, and preserves enamel integrity.' },
                { id: '6', num: '6.', question: 'Do you provide emergency dental care?', answer: 'Yes. We offer prompt emergency dental appointments for acute pain, trauma, or broken restorations.' },
              ].map((item) => {
                const isOpen = openFaq === item.id || (openFaq === null && item.id === '1');
                return (
                  <div key={item.id} className={`faq-v3__box ${isOpen ? 'faq-v3__box--open' : ''}`}>
                    <button
                      className="faq-v3__box-question"
                      onClick={() => setOpenFaq(isOpen && openFaq !== null ? '' : item.id)}
                    >
                      <span>{item.num} {item.question}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-v3__box-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
