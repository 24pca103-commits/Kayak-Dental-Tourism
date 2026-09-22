import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialsAPI, feedbackAPI } from '../services/api';
import type { Testimonial } from '../types';
import { getPublishedVideos, getVideoBlobUrl } from '../utils/videoStorage';
import '../styles/DentalTourismPage.css';

const DEMO: Testimonial[] = [
  {
    _id: '1',
    patientName: 'Prashansa Meyn (Odense, Denmark)',
    review: 'I visited Kayal Dental Clinic where Dr. Sahana treated me for multiple root canals, crown placements, and a tooth extraction which was absolutely painless. Before the treatment, I had serious difficulty chewing solid foods, and now I can comfortably eat any food! The entire team at Kayal Dental was extremely empathetic, welcoming, and even adjusted appointment timings to fit my vacation schedule. A heartfelt thank you to Dr. Sahana and the whole team!',
    rating: 5,
    status: 'active',
    createdAt: ''
  },
  {
    _id: '2',
    patientName: 'Tony',
    review: 'I work in Denmark and came to Kayal Dental Clinic for dental checkups and treatments after my wife had an amazing experience with Dr. Sahana. Dr. Sahana, Dr. Usha, and Dr. Bhaskar performed my root canal procedures in a very gentle and completely painless manner. We are all extremely happy with the results. I highly recommend Kayal Dental Clinic for international patients from anywhere in the world!',
    rating: 5,
    status: 'active',
    createdAt: ''
  },
  { _id: '3', patientName: 'Priya S.', review: 'I visited Kayal Dental Tourism for teeth replacement, and I am extremely happy with the treatment. The clinic is very clean, modern, and equipped with the latest technology. The doctors are patient, friendly, and truly care about your comfort.', rating: 5, status: 'active', createdAt: '' },
  { _id: '4', patientName: 'Karthik R.', review: 'KAYAL Dental Care made me feel comfortable from the moment I walked in. The doctors explained everything clearly, and my smile makeover results were better than I expected. Highly recommend!', rating: 5, status: 'active', createdAt: '' },
  { _id: '5', patientName: 'Suresh M.', review: 'I got dental implants done here. The procedure was explained in detail and the post-treatment care was excellent. The implants look and feel completely natural.', rating: 5, status: 'active', createdAt: '' },
  { _id: '6', patientName: 'Deepa K.', review: 'Professional team, modern equipment, and a very hygienic clinic. The teeth whitening treatment gave me amazing results. I feel so much more confident now!', rating: 5, status: 'active', createdAt: '' },
];

interface VideoItem {
  id: string;
  name: string;
  location: string;
  tag: string;
  videoSrc: string;
  stars: number;
  message?: string;
  isUserSubmitted?: boolean;
}

const REAL_VIDEOS: VideoItem[] = [
  {
    id: 'static_1',
    name: 'Prashansa Meyn',
    location: 'International Patient',
    tag: 'Root Canals & Crowns',
    videoSrc: '/assets/4.mp4',
    stars: 5,
  },
  {
    id: 'static_2',
    name: 'Tony',
    location: 'International Patient',
    tag: 'Root Canal & Checkup',
    videoSrc: '/assets/3.mp4',
    stars: 5,
  },
  {
    id: 'static_3',
    name: 'Anitha',
    location: 'International Patient',
    tag: 'Dental Implants & Smile',
    videoSrc: '/assets/Kayal Dental - Client Review 1.mp4',
    stars: 5,
  },
  {
    id: 'static_4',
    name: 'Marcus Tan',
    location: 'International Patient',
    tag: 'Full Mouth Rehab',
    videoSrc: '/assets/Kayal Dental- Client Review 2.mp4',
    stars: 5,
  },
];

const TestimonialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videoList, setVideoList] = useState<VideoItem[]>(REAL_VIDEOS);

  const list = testimonials.length > 0 ? testimonials : DEMO;
  const avg = (list.reduce((a, t) => a + t.rating, 0) / list.length).toFixed(1);

  const resolveVideoUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.includes('/uploads/')) {
      const idx = url.indexOf('/uploads/');
      return url.substring(idx);
    }
    return url;
  };

  const loadAllVideos = async () => {
    try {
      const userVideos: VideoItem[] = [];
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
                  location: 'Verified Patient',
                  tag: f.subject || 'Patient Review',
                  videoSrc: videoSrc,
                  stars: f.rating || 5,
                  message: f.message,
                  isUserSubmitted: true,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Backend feedback fetch notice for testimonials:', err);
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
                location: pub.location || 'Verified Patient Review',
                tag: pub.tag || 'Patient Feedback',
                videoSrc: blobUrl,
                stars: pub.rating || 5,
                message: pub.message,
                isUserSubmitted: true,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Local published videos check:', err);
      }

      const combined = [...userVideos, ...REAL_VIDEOS];
      setVideoList(prev => {
        if (
          prev.length === combined.length &&
          prev[0]?.id === combined[0]?.id &&
          prev[0]?.videoSrc === combined[0]?.videoSrc
        ) {
          return prev;
        }
        return combined;
      });
    } catch (err) {
      console.error('Failed to load published videos:', err);
      setVideoList(REAL_VIDEOS);
    }
  };

  useEffect(() => {
    document.title = 'Testimonials & Reviews | KAYAL Dental Care';
    testimonialsAPI.getAll().then(r => setTestimonials(r.data?.data || [])).catch(() => setTestimonials(DEMO));
    loadAllVideos();

    // Auto-poll published videos every 2.5s for live cross-origin admin updates
    const pollInterval = setInterval(() => {
      loadAllVideos();
    }, 2500);

    window.addEventListener('storage', loadAllVideos);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kayal_live_sync');
      bc.onmessage = () => loadAllVideos();
    } catch { }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', loadAllVideos);
      if (bc) bc.close();
    };
  }, []);

  // Carousel state for Patient Reviews & Stories (Section 2)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [isTabletScreen, setIsTabletScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024);

  // Carousel state for Review Videos (Section 4)
  const [reviewSlide, setReviewSlide] = useState(0);
  const [isReviewHovered, setIsReviewHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [showReviewLeft, setShowReviewLeft] = useState(false);
  const [showReviewRight, setShowReviewRight] = useState(false);
  const reviewLeftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewRightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reviewTouchStart, setReviewTouchStart] = useState<number | null>(null);
  const [reviewTouchEnd, setReviewTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
      setIsTabletScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
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

  const maxReviewSlide = Math.max(0, videoList.length - visibleCount);

  const triggerReviewLeft = () => {
    setShowReviewLeft(true);
    setShowReviewRight(false);
    if (reviewLeftTimer.current) clearTimeout(reviewLeftTimer.current);
    reviewLeftTimer.current = setTimeout(() => setShowReviewLeft(false), 1800);
  };

  const triggerReviewRight = () => {
    setShowReviewRight(true);
    setShowReviewLeft(false);
    if (reviewRightTimer.current) clearTimeout(reviewRightTimer.current);
    reviewRightTimer.current = setTimeout(() => setShowReviewRight(false), 1800);
  };

  const handleReviewPrev = () => {
    setReviewSlide((prev) => (prev <= 0 ? maxReviewSlide : prev - 1));
    triggerReviewLeft();
  };

  const handleReviewNext = () => {
    setReviewSlide((prev) => (prev >= maxReviewSlide ? 0 : prev + 1));
    triggerReviewRight();
  };

  const handleReviewWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 12) {
      triggerReviewRight();
    } else if (delta < -12) {
      triggerReviewLeft();
    }
  };

  const handleReviewTouchStart = (e: React.TouchEvent) => {
    setReviewTouchEnd(null);
    setReviewTouchStart(e.targetTouches[0].clientX);
  };

  const handleReviewTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setReviewTouchEnd(currentX);
    if (reviewTouchStart !== null) {
      const diff = reviewTouchStart - currentX;
      if (diff > 15) {
        triggerReviewRight();
      } else if (diff < -15) {
        triggerReviewLeft();
      }
    }
  };

  const handleReviewTouchEnd = () => {
    if (reviewTouchStart !== null && reviewTouchEnd !== null) {
      const distance = reviewTouchStart - reviewTouchEnd;
      if (distance > 40) {
        setReviewSlide((prev) => (prev >= maxReviewSlide ? 0 : prev + 1));
      } else if (distance < -40) {
        setReviewSlide((prev) => (prev <= 0 ? maxReviewSlide : prev - 1));
      }
    }
  };

  useEffect(() => {
    if (isReviewHovered || maxReviewSlide <= 0) return;
    const timer = setInterval(() => {
      setReviewSlide((prev) => (prev >= maxReviewSlide ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [isReviewHovered, maxReviewSlide]);

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
    setActiveVideoIdx((prev) => (prev - 1 + videoList.length) % videoList.length);
    triggerLeftIcon();
  };

  const handleNextSlide = () => {
    setActiveVideoIdx((prev) => (prev + 1) % videoList.length);
    triggerRightIcon();
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 12) {
      triggerRightIcon();
    } else if (delta < -12) {
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
        triggerRightIcon();
      } else if (diff < -15) {
        triggerLeftIcon();
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      if (distance > 40) {
        setActiveVideoIdx((prev) => (prev + 1) % videoList.length);
      } else if (distance < -40) {
        setActiveVideoIdx((prev) => (prev - 1 + videoList.length) % videoList.length);
      }
    }
  };

  // Auto-scroll for Video Reviews (pauses on hover or video play)
  useEffect(() => {
    if (isHovered || isPlayingVideo || videoList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveVideoIdx((prev) => (prev + 1) % videoList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, isPlayingVideo, videoList.length]);

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* ── Hero Banner Section ── */}
      <section className="testimonials-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '0.85rem', display: 'inline-flex' }}>Patient Stories</div>
          <h1 className="section-title text-white" style={{ textAlign: 'left', margin: '0 0 0.6rem 0', fontSize: 'clamp(2rem, 3.8vw, 3rem)' }}>What Our Patients Say</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', maxWidth: '600px', textAlign: 'left', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Real experiences and authentic reviews from patients who trusted us with their smile transformations across the globe.
          </p>
        </div>
      </section>

      {/* ── Video Reviews Section ── */}
      <section id="reviews" className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Verified Reviews</div>
            <h2 className="section-title">Patient Reviews &amp; Stories</h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Watch real patient video testimonials from Denmark, Singapore, and across the globe.
            </p>
          </div>

          <div
            className="testimonials-page__slider-wrap"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="testimonials-page__slider-container"
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Arrow Button – visible strictly on manual swipe/scroll */}
              <button
                type="button"
                className={`testimonials-page__arrow-btn testimonials-page__arrow-btn--prev ${showLeftIcon ? 'is-visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevSlide();
                  e.currentTarget.blur();
                }}
                aria-label="Previous Testimonial Video"
              >
                <ChevronLeft size={25} strokeWidth={2.8} />
              </button>

              {/* Right Arrow Button – visible strictly on manual swipe/scroll */}
              <button
                type="button"
                className={`testimonials-page__arrow-btn testimonials-page__arrow-btn--next ${showRightIcon ? 'is-visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextSlide();
                  e.currentTarget.blur();
                }}
                aria-label="Next Testimonial Video"
              >
                <ChevronRight size={25} strokeWidth={2.8} />
              </button>

              {/* Cards Grid: Mobile = 1 card, Tablet = 2 cards, Desktop = 3 cards */}
              <div className="testimonials-page__cards-grid">
                {(isMobileScreen ? [0] : isTabletScreen ? [0, 1] : [0, 1, 2]).map((offset) => {
                  const itemIndex = (activeVideoIdx + offset) % videoList.length;
                  const v = videoList[itemIndex];
                  if (!v) return null;
                  return (
                    <motion.div
                      key={`${itemIndex}-${offset}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`testimonials-page__card ${v.isUserSubmitted ? 'testimonials-page__card--highlight' : ''}`}
                    >
                      {/* Video Area */}
                      <div className="testimonials-page__video-wrap">
                        <video
                          src={v.videoSrc}
                          controls
                          preload="metadata"
                          playsInline
                          onPlay={() => setIsPlayingVideo(true)}
                          onPause={() => setIsPlayingVideo(false)}
                          onEnded={() => setIsPlayingVideo(false)}
                        />
                      </div>

                      {/* Card Info */}
                      <div className="testimonials-page__card-body">
                        <div className="testimonials-page__card-top">
                          <div className="testimonials-page__card-stars">
                            {Array.from({ length: v.stars || 5 }).map((_, j) => (
                              <Star key={j} size={13} fill="#fbbf24" color="#fbbf24" />
                            ))}
                          </div>
                          <span className="testimonials-page__card-tag">
                            {v.tag}
                          </span>
                        </div>

                        <div>
                          <div className="testimonials-page__card-name">{v.name}</div>
                          <div className="testimonials-page__card-location">
                            <CheckCircle2 size={12} color="#25D366" /> {v.location}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Slider Dots */}
            {videoList.length > 1 && (
              <div className="testimonials-page__dots">
                {videoList.map((_, i) => (
                  <button
                    key={i}
                    className={`testimonials-page__dot ${i === activeVideoIdx ? 'testimonials-page__dot--active' : ''}`}
                    onClick={(e) => {
                      setActiveVideoIdx(i);
                      e.currentTarget.blur();
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>




      {/* ── Dedicated Patient Feedback & Stats Section (Right after Reviews) ── */}
      <section id="feedback" className="section" style={{ background: 'linear-gradient(135deg, #350d58 0%, #451271 50%, #240840 100%)', padding: '3.5rem 1.5rem', color: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="badge badge-white" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Patient Feedback</div>
            <h2 className="section-title text-white" style={{ color: '#ffffff', margin: '0 auto 0.5rem auto', textAlign: 'center' }}>
              Trusted Quality &amp; <span style={{ whiteSpace: 'nowrap' }}>Patient Satisfaction</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '620px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
              Our commitment to painless treatments and world-class dental care reflects in every smile we create.
            </p>
          </div>

          <div className="testimonials-stats-row">
            <div className="testimonials-stat-col">
              <div className="testimonials-stat-num">{avg}</div>
              <div className="testimonials-stat-stars">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="#24E0E1" color="#24E0E1" />)}
              </div>
              <div className="testimonials-stat-label">Average Patient Rating</div>
            </div>

            <div className="testimonials-stat-col">
              <div className="testimonials-stat-num">5,000+</div>
              <div className="testimonials-stat-label">Happy Smiles Transformed</div>
            </div>

            <div className="testimonials-stat-col">
              <div className="testimonials-stat-num">100%</div>
              <div className="testimonials-stat-label">Pain-free &amp; Gentle Care</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video Reviews Section (YouTube-Style Sliding Carousel) ── */}
      <section id="videos" className="section" style={{ background: '#f8fafc', overflow: 'hidden' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Video Stories</div>
            <h2 className="section-title">Review Videos</h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Watch our international patients share their complete dental journey and smile results.
            </p>
          </div>

          {/* Auto-sliding Carousel Container */}
          <div
            className="video-auto-slider-container"
            onMouseEnter={() => setIsReviewHovered(true)}
            onMouseLeave={() => setIsReviewHovered(false)}
            onWheel={handleReviewWheel}
            onTouchStart={handleReviewTouchStart}
            onTouchMove={handleReviewTouchMove}
            onTouchEnd={handleReviewTouchEnd}
          >
            {/* Left Sliding Icon – shows strictly on manual left scroll/swipe */}
            <button
              type="button"
              onClick={handleReviewPrev}
              className={`slider-nav-btn slider-nav-btn--prev ${showReviewLeft ? 'is-visible' : ''}`}
              aria-label="Previous Review Video"
            >
              <ChevronLeft size={25} strokeWidth={2.8} />
            </button>

            {/* Right Sliding Icon – shows strictly on manual right scroll/swipe */}
            <button
              type="button"
              onClick={handleReviewNext}
              className={`slider-nav-btn slider-nav-btn--next ${showReviewRight ? 'is-visible' : ''}`}
              aria-label="Next Review Video"
            >
              <ChevronRight size={25} strokeWidth={2.8} />
            </button>

            {/* Overflow Hidden Track Wrap */}
            <div className="video-auto-slider-wrap">
              <div
                className="video-auto-slider-track"
                style={{
                  transform: `translateX(-${reviewSlide * (100 / visibleCount)}%)`,
                }}
              >
                {videoList.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="video-auto-slider-item"
                    style={{ flex: `0 0 ${100 / visibleCount}%` }}
                  >
                    <div className="video-slider-card">
                      <div className="video-slider-iframe-wrap">
                        <video
                          src={v.videoSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="video-slider-video"
                        />
                      </div>
                      <div className="video-slider-meta">
                        <span className="video-slider-name">{v.name} · {v.location}</span>
                        <span className="video-slider-tag">{v.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="slider-dots">
              {Array.from({ length: maxReviewSlide + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-dot ${reviewSlide === idx ? 'slider-dot--active' : ''}`}
                  onClick={() => setReviewSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="text-white mb-4">Ready to Experience World-Class Dental Care?</h2>
            <p className="text-white mb-8 max-w-2xl mx-auto opacity-90">
              Schedule your consultation today and take the first step towards a healthier, more beautiful smile.
            </p>
            <button
              className="btn btn-cyan btn-lg"
              onClick={() => navigate('/online-consultation')}
              style={{
                background: '#24E0E1',
                color: '#350d58',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                borderRadius: '9999px',
                padding: '0.85rem 2.25rem',
                border: '1.5px solid #24E0E1',
                cursor: 'pointer'
              }}
            >
              <span>Book Online Consultation</span>
              <ArrowRight
                size={18}
                color="#350d58"
                style={{
                  color: '#350d58',
                  stroke: '#350d58',
                  fill: 'none',
                  flexShrink: 0
                }}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
