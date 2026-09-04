import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane,
  MapPin,
  Award,
  ShieldCheck,
  CheckCircle2,
  Video,
  FileText,
  Hospital,
  HeartPulse,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import './DentalTourismPage.css';

const VIDEO_TESTIMONIALS = [
  { name: 'Priya S.', country: 'UK 🇬🇧', tag: 'Dental Implants', videoId: 'dQw4w9WgXcQ' },
  { name: 'Karthik R.', country: 'UAE 🇦🇪', tag: 'Smile Makeover', videoId: 'dQw4w9WgXcQ' },
  { name: 'Sarah M.', country: 'USA 🇺🇸', tag: 'Full Mouth Rehab', videoId: 'dQw4w9WgXcQ' },
  { name: 'Ahmed K.', country: 'Qatar 🇶🇦', tag: 'Zirconia Crowns', videoId: 'dQw4w9WgXcQ' },
  { name: 'Lisa W.', country: 'Australia 🇦🇺', tag: 'Veneers', videoId: 'dQw4w9WgXcQ' },
];

const costData = [
  { treatment: 'Single Implant', india: 500, usa: 3000, uk: 2500, uae: 2000, max: 3000 },
  { treatment: 'Full Mouth Rehab', india: 3000, usa: 20000, uk: 15000, uae: 12000, max: 20000 },
  { treatment: 'Zirconia Crown', india: 150, usa: 1200, uk: 800, uae: 600, max: 1200 },
  { treatment: 'Root Canal + Crown', india: 200, usa: 2000, uk: 1500, uae: 1000, max: 2000 },
  { treatment: 'Smile Makeover', india: 2000, usa: 15000, uk: 12000, uae: 8000, max: 15000 },
];

const journeySteps = [
  { id: 1, title: 'Free Consultation', desc: 'Share dental concerns via video call or WhatsApp', icon: <Video className="w-6 h-6" /> },
  { id: 2, title: 'Treatment Plan', desc: 'Receive detailed plan with costs and timeline', icon: <FileText className="w-6 h-6" /> },
  { id: 3, title: 'Travel & Arrival', desc: 'We assist with visa, flights, airport pickup', icon: <Plane className="w-6 h-6" /> },
  { id: 4, title: 'Treatment', desc: 'World-class treatment at state-of-the-art facility', icon: <Hospital className="w-6 h-6" /> },
  { id: 5, title: 'Recovery & Explore', desc: 'Heal while enjoying India\'s culture', icon: <MapPin className="w-6 h-6" /> },
  { id: 6, title: 'Follow-up Care', desc: 'Virtual follow-ups after you return', icon: <HeartPulse className="w-6 h-6" /> },
];

const qualityStandards = [
  { id: 1, title: 'ISO 9001 Certified', icon: <Award className="w-8 h-8 text-cyan-400" /> },
  { id: 2, title: 'International-grade sterilization', icon: <ShieldCheck className="w-8 h-8 text-cyan-400" /> },
  { id: 3, title: 'Premium implant systems', icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" />, sub: 'Nobel Biocare, Straumann' },
  { id: 4, title: 'Digital imaging & planning', icon: <Award className="w-8 h-8 text-cyan-400" /> },
  { id: 5, title: 'Multilingual staff', icon: <MessageCircle className="w-8 h-8 text-cyan-400" /> },
  { id: 6, title: '98% implant success rate', icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" /> },
];

const DentalTourismPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlide = Math.max(0, VIDEO_TESTIMONIALS.length - visibleCount);

  // Auto sliding option every 3.5 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, maxSlide]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  return (
    <div className="dental-tourism-page">
      {/* 1. Hero */}
      <section id="why-india" className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title font-display">Why Choose India for Dental Care</h1>
            <p className="hero-subtitle">World-class dental treatments at a fraction of the cost, combining your smile transformation with a memorable vacation.</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">70%</span>
                <span className="stat-text">Cost Savings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">7 Lakh+</span>
                <span className="stat-text">International Patients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-text">Success Rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Cost Comparison */}
      <section id="cost-comparison" className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title font-display">Transparent Cost Comparison</h2>
            <p className="section-subtitle">See why thousands travel to India for their dental care</p>
            <p style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: '#92400e',
              fontStyle: 'italic',
              background: '#fef3c7',
              border: '1.5px solid #f59e0b',
              borderRadius: '8px',
              padding: '0.45rem 1rem',
              display: 'inline-block',
              fontWeight: 600,
            }}>
              ⚠️ # Approximate rates — actual cost may vary based on individual treatment plan.
            </p>
          </div>

          <div className="cost-chart-container">
            {costData.map((item, index) => (
              <motion.div
                key={index}
                className="cost-row"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="cost-treatment-name">{item.treatment}</div>
                <div className="cost-bars">
                  <div className="cost-bar-group">
                    <span className="cost-label">India</span>
                    <motion.div
                      className="bar bar-india"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.india / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                      <span className="bar-value">${item.india}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">USA</span>
                    <motion.div
                      className="bar bar-usa"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.usa / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <span className="bar-value">${item.usa}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">UK</span>
                    <motion.div
                      className="bar bar-uk"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.uk / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4 }}
                    >
                      <span className="bar-value">${item.uk}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">UAE</span>
                    <motion.div
                      className="bar bar-uae"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.uae / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      <span className="bar-value">${item.uae}</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Patient Journey Timeline */}
      <section id="journey" className="section bg-light-gray">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title font-display">Your Journey With Us</h2>
            <p className="section-subtitle">A seamless experience from consultation to recovery</p>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="timeline-circle">
                  {step.id}
                </div>
                <div className="timeline-content card">
                  <div className="timeline-icon-wrap">
                    {step.icon}
                  </div>
                  <h3 className="timeline-title">{step.title}</h3>
                  <p className="timeline-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Quality & Safety Standards */}
      <section id="safety" className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title font-display">World-Class Quality & Safety</h2>
            <p className="section-subtitle">We never compromise on international standards</p>
          </div>

          <div className="standards-grid">
            {qualityStandards.map((item) => (
              <motion.div
                key={item.id}
                className="standard-card card"
                whileHover={{ y: -5 }}
              >
                <div className="standard-icon">
                  {item.icon}
                </div>
                <h3 className="standard-title">{item.title}</h3>
                {item.sub && <p className="standard-sub">{item.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Patient Testimonials – Auto-Sliding Video Carousel (No Horizontal Scroller) */}
      <section id="testimonials" className="section bg-light-gray">
        <div className="container">
          <div className="text-center mb-12">
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Patient Stories</div>
            <h2 className="section-title font-display">Real Reviews From Real Patients</h2>
            <p className="section-subtitle">Hear directly from our international patients who flew for their smile transformation</p>
          </div>

          {/* Auto-sliding Carousel Container */}
          <div
            className="video-auto-slider-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Arrow Buttons */}
            <button
              className="slider-nav-btn slider-nav-btn--prev"
              onClick={handlePrev}
              aria-label="Previous Video Review"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="slider-nav-btn slider-nav-btn--next"
              onClick={handleNext}
              aria-label="Next Video Review"
            >
              <ChevronRight size={22} />
            </button>

            {/* Overflow Hidden Track Wrap – No Scroller Bar */}
            <div className="video-auto-slider-wrap">
              <div
                className="video-auto-slider-track"
                style={{
                  transform: `translateX(-${currentSlide * (100 / visibleCount)}%)`,
                }}
              >
                {VIDEO_TESTIMONIALS.map((v, i) => (
                  <div
                    key={i}
                    className="video-auto-slider-item"
                    style={{ flex: `0 0 ${100 / visibleCount}%` }}
                  >
                    <div className="video-slider-card">
                      <div className="video-slider-iframe-wrap">
                        <iframe
                          src={``}
                          title={`Patient Review – ${v.name}`}
                          allow="encrypted-media"
                          allowFullScreen
                          className="video-slider-iframe"
                        />
                      </div>
                      <div className="video-slider-meta">
                        <span className="video-slider-name">{v.name} · {v.country}</span>
                        <span className="video-slider-tag">{v.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="slider-dots">
              {Array.from({ length: maxSlide + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-dot ${currentSlide === idx ? 'slider-dot--active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2 className="font-display">Ready to Transform Your Smile?</h2>
            <p>Get a free personalized treatment plan and cost estimate today.</p>
            <div className="cta-buttons">
              <Link to="/online-consultation" className="btn btn-primary">
                Book Consultation
              </Link>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn btn-outline-light" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <WhatsAppIcon size={18} color="#25D366" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DentalTourismPage;
