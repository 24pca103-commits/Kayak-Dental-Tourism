import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { feedbackAPI } from '../services/api';
import { getPublishedVideos, getVideoBlobUrl } from '../utils/videoStorage';
import '../styles/DentalTourismPage.css';

interface VideoTestimonial {
  id?: string;
  name: string;
  country: string;
  tag: string;
  videoUrl?: string;
  videoId?: string;
}

const STATIC_VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  { id: 'dt_1', name: 'Prashansa Meyn', country: 'International Patient', tag: 'Root Canals & Crowns', videoUrl: '/assets/4.mp4' },
  { id: 'dt_2', name: 'Michael Hansen', country: 'International Patient', tag: 'Root Canals & Dental Checkup', videoUrl: '/assets/3.mp4' },
  { id: 'dt_3', name: 'Anitha', country: 'International Patient', tag: 'Dental Implants & Smile Makeover', videoUrl: '/assets/Kayal Dental - Client Review 1.mp4' },
  { id: 'dt_4', name: 'Marcus Tan', country: 'International Patient', tag: 'Full Mouth Rehabilitation', videoUrl: '/assets/Kayal Dental- Client Review 2.mp4' },
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
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>(STATIC_VIDEO_TESTIMONIALS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const resolveVideoUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.includes('/uploads/')) {
      const idx = url.indexOf('/uploads/');
      return url.substring(idx);
    }
    return url;
  };

  const loadPublishedVideos = async () => {
    try {
      const userVideos: VideoTestimonial[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch published reviews directly from backend API
      try {
        const res = await feedbackAPI.getAll();
        const serverFeedbacks = res.data?.data;
        if (Array.isArray(serverFeedbacks)) {
          for (const f of serverFeedbacks) {
            if (f.isPublishedToTestimonials && (f.videoUrl || f.videoKey)) {
              let videoSrc = '';
              if (f.videoUrl) {
                videoSrc = resolveVideoUrl(f.videoUrl);
              } else if (f.videoKey) {
                videoSrc = (await getVideoBlobUrl(f.videoKey)) || '';
              }

              if (videoSrc) {
                seenIds.add(f._id);
                userVideos.push({
                  id: f._id,
                  name: f.name,
                  country: 'International Patient',
                  tag: f.subject || 'Dental Tourism Review',
                  videoUrl: videoSrc,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Backend feedback fetch notice for dental tourism:', err);
      }

      // 2. Also check local published videos fallback (for offline or local IndexedDB)
      try {
        const published = getPublishedVideos();
        for (const pub of published) {
          if (!seenIds.has(pub._id) && !seenIds.has(pub.feedbackId)) {
            let blobUrl = '';
            if (pub.videoUrl) {
              blobUrl = resolveVideoUrl(pub.videoUrl);
            } else if (pub.videoKey) {
              blobUrl = (await getVideoBlobUrl(pub.videoKey)) || '';
            }

            if (blobUrl) {
              seenIds.add(pub._id);
              userVideos.push({
                id: pub._id,
                name: pub.patientName,
                country: 'International Patient',
                tag: pub.tag || 'Dental Tourism Review',
                videoUrl: blobUrl,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Local published videos check:', err);
      }

      const combined = [...userVideos, ...STATIC_VIDEO_TESTIMONIALS];
      setVideoTestimonials(prev => {
        if (
          prev.length === combined.length &&
          prev[0]?.id === combined[0]?.id &&
          prev[0]?.videoUrl === combined[0]?.videoUrl
        ) {
          return prev;
        }
        return combined;
      });
    } catch (err) {
      console.error('Failed to load published videos:', err);
      setVideoTestimonials(STATIC_VIDEO_TESTIMONIALS);
    }
  };

  useEffect(() => {
    loadPublishedVideos();

    // Auto-poll published videos every 2.5s for live cross-origin admin updates
    const pollInterval = setInterval(() => {
      loadPublishedVideos();
    }, 2500);

    window.addEventListener('storage', loadPublishedVideos);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kayal_live_sync');
      bc.onmessage = () => loadPublishedVideos();
    } catch { }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', loadPublishedVideos);
      if (bc) bc.close();
    };
  }, []);

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

  const maxSlide = Math.max(0, videoTestimonials.length - visibleCount);

  // Directional manual scroll indicator states
  const [showLeftIcon, setShowLeftIcon] = useState(false);
  const [showRightIcon, setShowRightIcon] = useState(false);
  const leftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const triggerLeftIcon = () => {
    setShowLeftIcon(true);
    setShowRightIcon(false);
    if (leftTimerRef.current) clearTimeout(leftTimerRef.current);
    leftTimerRef.current = setTimeout(() => setShowLeftIcon(false), 1800);
  };

  const triggerRightIcon = () => {
    setShowRightIcon(true);
    setShowLeftIcon(false);
    if (rightTimerRef.current) clearTimeout(rightTimerRef.current);
    rightTimerRef.current = setTimeout(() => setShowRightIcon(false), 1800);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    triggerLeftIcon();
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    triggerRightIcon();
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 12) {
      // User manual scrolling Right
      triggerRightIcon();
    } else if (delta < -12) {
      // User manual scrolling Left
      triggerLeftIcon();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEndX(currentX);
    if (touchStartX !== null) {
      const diff = touchStartX - currentX;
      if (diff > 15) {
        // Swiping Left (moving to next slide on right)
        triggerRightIcon();
      } else if (diff < -15) {
        // Swiping Right (moving to prev slide on left)
        triggerLeftIcon();
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      if (distance > 40) {
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
      } else if (distance < -40) {
        setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
      }
    }
  };

  // Auto sliding option every 3.5 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, maxSlide]);

  return (
    <div className="dental-tourism-page">
      {/* 1. Hero */}
      <section id="why-india" className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Global Dental Tourism</div>
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
          <div className="text-center mb-12" style={{ textAlign: 'center' }}>
            <h2 className="section-title font-display" style={{ textAlign: 'center' }}>Transparent Cost Comparison</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>See why thousands travel to India for their dental care</p>
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
          <div className="text-center mb-12" style={{ textAlign: 'center' }}>
            <h2 className="section-title font-display" style={{ textAlign: 'center' }}>World-Class Quality & Safety</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>We never compromise on international standards</p>
          </div>

          <div className="standards-grid">
            {qualityStandards.map((item) => (
              <motion.div
                key={item.id}
                className="standard-card card"
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
          <div className="text-center mb-12" style={{ textAlign: 'center' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Patient Stories</div>
            <h2 className="section-title font-display" style={{ textAlign: 'center' }}>Real Reviews From Real Patients</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>Hear directly from our international patients who flew for their smile transformation</p>
          </div>

          {/* Auto-sliding Carousel Container */}
          <div
            className="video-auto-slider-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Sliding Icon – shows strictly on manual left scroll/swipe */}
            <button
              type="button"
              onClick={handlePrevSlide}
              className={`slider-nav-btn slider-nav-btn--prev ${showLeftIcon ? 'is-visible' : ''}`}
              aria-label="Previous Review Video"
            >
              <ChevronLeft size={25} strokeWidth={2.8} />
            </button>

            {/* Right Sliding Icon – shows strictly on manual right scroll/swipe */}
            <button
              type="button"
              onClick={handleNextSlide}
              className={`slider-nav-btn slider-nav-btn--next ${showRightIcon ? 'is-visible' : ''}`}
              aria-label="Next Review Video"
            >
              <ChevronRight size={25} strokeWidth={2.8} />
            </button>

            {/* Overflow Hidden Track Wrap – No Scroller Bar */}
            <div className="video-auto-slider-wrap">
              <div
                className="video-auto-slider-track"
                style={{
                  transform: `translateX(-${currentSlide * (100 / visibleCount)}%)`,
                }}
              >
                {videoTestimonials.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="video-auto-slider-item"
                    style={{ flex: `0 0 ${100 / visibleCount}%` }}
                  >
                    <div className="video-slider-card">
                      <div className="video-slider-iframe-wrap">
                        {v.videoUrl ? (
                          <video
                            src={v.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="video-slider-video"
                          />
                        ) : v.videoId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${v.videoId}`}
                            title={`Patient Review – ${v.name}`}
                            allow="encrypted-media"
                            allowFullScreen
                            className="video-slider-iframe"
                          />
                        ) : null}
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
            <h2 className="font-display dt-cta-title">Ready to Transform Your Smile?</h2>
            <p>Get a free personalized treatment plan and cost estimate today.</p>
            <div className="cta-buttons">
              <Link to="/online-consultation" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book Online Consultation <ArrowRight size={18} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
              </Link>
              <a
                href="https://wa.me/917867926159"
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp-cta"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
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
