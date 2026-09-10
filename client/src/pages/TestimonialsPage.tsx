import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialsAPI } from '../services/api';
import type { Testimonial } from '../types';

const DEMO: Testimonial[] = [
  { _id: '1', patientName: 'Priya S.', review: 'I visited Kayal Dental Tourism for teeth replacement, and I am extremely happy with the treatment. The clinic is very clean, modern, and equipped with the latest technology. The doctors are patient, friendly, and truly care about your comfort.', rating: 5, status: 'active', createdAt: '' },
  { _id: '2', patientName: 'Karthik R.', review: 'KAYAL Dental Care made me feel comfortable from the moment I walked in. The doctors explained everything clearly, and my smile makeover results were better than I expected. Highly recommend!', rating: 5, status: 'active', createdAt: '' },
  { _id: '3', patientName: 'Meena L.', review: 'Best dental clinic! My daughter was very nervous about her first dental visit, but the pediatric dentist at KAYAL made her feel at ease immediately. Great experience overall.', rating: 5, status: 'active', createdAt: '' },
  { _id: '4', patientName: 'Suresh M.', review: 'I got dental implants done here. The procedure was explained in detail and the post-treatment care was excellent. The implants look and feel completely natural.', rating: 5, status: 'active', createdAt: '' },
  { _id: '5', patientName: 'Deepa K.', review: 'Professional team, modern equipment, and a very hygienic clinic. The teeth whitening treatment gave me amazing results. I feel so much more confident now!', rating: 5, status: 'active', createdAt: '' },
  { _id: '6', patientName: 'Raj N.', review: 'Got my braces treatment done at KAYAL. The orthodontist was exceptional — patient, thorough, and very knowledgeable. My smile has completely transformed.', rating: 5, status: 'active', createdAt: '' },
];

const PATIENT_VIDEOS = [
  {
    name: 'Sarah Jenkins (UK)',
    tag: 'Full Mouth Implants',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'Michael Davis (USA)',
    tag: 'Smile Makeover & Veneers',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    name: 'Fatima Al-Mansoor (UAE)',
    tag: 'Zirconia Crowns & Bridges',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  }
];

const TestimonialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const list = testimonials.length > 0 ? testimonials : DEMO;
  const avg = (list.reduce((a, t) => a + t.rating, 0) / list.length).toFixed(1);

  // Review cards slider state (auto & manual sliding for mobile view)
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const reviewTouchStartX = useRef<number | null>(null);
  const reviewTouchEndX = useRef<number | null>(null);
  const isDraggingReview = useRef(false);
  const isPausedReview = useRef(false);

  // Auto-sliding every 4.5s for review cards
  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      if (!isPausedReview.current) {
        setActiveReviewIdx(prev => (prev < list.length - 1 ? prev + 1 : 0));
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [list.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // swipe left -> next
      setActiveVideoIdx(prev => (prev < PATIENT_VIDEOS.length - 1 ? prev + 1 : 0));
    } else if (diff < -50) {
      // swipe right -> prev
      setActiveVideoIdx(prev => (prev > 0 ? prev - 1 : PATIENT_VIDEOS.length - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Review card touch handlers (manual sliding / swipe)
  const handleReviewTouchStart = (e: React.TouchEvent) => {
    isPausedReview.current = true;
    reviewTouchStartX.current = e.targetTouches[0].clientX;
  };

  const handleReviewTouchMove = (e: React.TouchEvent) => {
    reviewTouchEndX.current = e.targetTouches[0].clientX;
  };

  const handleReviewTouchEnd = () => {
    if (reviewTouchStartX.current !== null && reviewTouchEndX.current !== null) {
      const diff = reviewTouchStartX.current - reviewTouchEndX.current;
      if (diff > 40) {
        // swipe left -> next
        setActiveReviewIdx(prev => (prev < list.length - 1 ? prev + 1 : 0));
      } else if (diff < -40) {
        // swipe right -> prev
        setActiveReviewIdx(prev => (prev > 0 ? prev - 1 : list.length - 1));
      }
    }
    reviewTouchStartX.current = null;
    reviewTouchEndX.current = null;
    setTimeout(() => {
      isPausedReview.current = false;
    }, 1200);
  };

  // Mouse drag handlers for desktop / testing
  const handleReviewMouseDown = (e: React.MouseEvent) => {
    isPausedReview.current = true;
    isDraggingReview.current = true;
    reviewTouchStartX.current = e.clientX;
  };

  const handleReviewMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingReview.current) return;
    reviewTouchEndX.current = e.clientX;
  };

  const handleReviewMouseUp = () => {
    if (isDraggingReview.current) {
      if (reviewTouchStartX.current !== null && reviewTouchEndX.current !== null) {
        const diff = reviewTouchStartX.current - reviewTouchEndX.current;
        if (diff > 40) {
          setActiveReviewIdx(prev => (prev < list.length - 1 ? prev + 1 : 0));
        } else if (diff < -40) {
          setActiveReviewIdx(prev => (prev > 0 ? prev - 1 : list.length - 1));
        }
      }
      isDraggingReview.current = false;
      reviewTouchStartX.current = null;
      reviewTouchEndX.current = null;
      setTimeout(() => {
        isPausedReview.current = false;
      }, 1200);
    }
  };

  useEffect(() => {
    document.title = 'Testimonials & Reviews | KAYAL Dental Care';
    testimonialsAPI.getAll().then(r => setTestimonials(r.data?.data || [])).catch(() => setTestimonials(DEMO));
  }, []);

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* ── Hero Banner Section ── */}
      <section className="testimonials-hero" style={{
        position: 'relative',
        backgroundColor: '#240840',
        backgroundImage: "linear-gradient(90deg, #240840 0%, #240840 28%, rgba(36, 8, 64, 0.92) 42%, rgba(69, 18, 113, 0.5) 65%, rgba(69, 18, 113, 0.1) 85%, transparent 100%), url('/assets/banner-smile-collage-1.jpg')",
        backgroundSize: 'auto 100%',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        minHeight: '360px',
        padding: '4.5rem 0 3.5rem',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        borderBottom: '2px solid #24E0E1'
      }}>
        <div className="container" style={{ textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '0.85rem', display: 'inline-flex' }}>Patient Stories</div>
          <h1 className="section-title text-white" style={{ textAlign: 'left', margin: '0 0 0.6rem 0', fontSize: 'clamp(2rem, 3.8vw, 3rem)' }}>What Our Patients Say</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', maxWidth: '600px', textAlign: 'left', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Real experiences and authentic reviews from patients who trusted us with their smile transformations across the globe.
          </p>
        </div>
      </section>

      {/* ── Written Reviews Section ── */}
      <section id="reviews" className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Verified Reviews</div>
            <h2 className="section-title">Patient Reviews &amp; Stories</h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Read direct feedback from patients who underwent root canals, implants, cosmetic makeovers, and aligners.
            </p>
          </div>

          {/* Desktop Grid Layout (hidden on mobile via CSS) */}
          <div className="reviews-desktop-grid">
            {list.map((t, i) => (
              <div
                key={t._id || i}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid rgba(69,18,113,0.12)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.75rem',
                  boxShadow: '0 8px 25px rgba(69,18,113,0.06)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 35px rgba(69,18,113,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(69,18,113,0.06)';
                }}
              >
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={{ color: 'var(--gray-700)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem', flexGrow: 1 }}>
                  "{t.review}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#451271,#350d58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#24E0E1', flexShrink: 0 }}>
                    {t.patientName.charAt(0)}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#451271', fontSize: '0.95rem', display: 'block' }}>{t.patientName}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} color="#25D366" /> Verified Patient
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Auto & Manual Swipe Sliding Carousel (Hidden on desktop, no arrow icons) */}
          <div
            className="reviews-mobile-slider"
            onMouseEnter={() => { isPausedReview.current = true; }}
            onMouseLeave={() => { isPausedReview.current = false; }}
          >
            <div
              className="reviews-slider-track"
              onTouchStart={handleReviewTouchStart}
              onTouchMove={handleReviewTouchMove}
              onTouchEnd={handleReviewTouchEnd}
              onMouseDown={handleReviewMouseDown}
              onMouseMove={handleReviewMouseMove}
              onMouseUp={handleReviewMouseUp}
              onMouseLeave={handleReviewMouseUp}
              style={{
                overflow: 'hidden',
                borderRadius: '16px',
                cursor: 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                padding: '4px 2px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  transform: `translateX(-${activeReviewIdx * 100}%)`,
                  transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
                  width: '100%',
                }}
              >
                {list.map((t, i) => (
                  <div
                    key={t._id || i}
                    style={{
                      flex: '0 0 100%',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0 4px',
                    }}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(69,18,113,0.12)',
                        borderRadius: '16px',
                        padding: '1.65rem 1.35rem',
                        boxShadow: '0 8px 24px rgba(69,18,113,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '260px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.85rem' }}>
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={15} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                      <p style={{ color: 'var(--gray-700)', fontSize: '0.92rem', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1.25rem', flexGrow: 1 }}>
                        "{t.review}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', borderTop: '1px solid #f3f4f6', paddingTop: '0.85rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#451271,#350d58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#24E0E1', flexShrink: 0 }}>
                          {t.patientName.charAt(0)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#451271', fontSize: '0.92rem', display: 'block' }}>{t.patientName}</span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} color="#25D366" /> Verified Patient
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Dots (No arrow icons) */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1.35rem' }}>
              {list.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveReviewIdx(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  style={{
                    width: activeReviewIdx === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: activeReviewIdx === idx ? '#451271' : '#cbd5e1',
                    border: activeReviewIdx === idx ? '1px solid #24E0E1' : 'none',
                    transition: 'all 0.3s ease',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dedicated Patient Feedback & Stats Section (Right after Reviews) ── */}
      <section id="feedback" className="section" style={{ background: 'linear-gradient(135deg, #350d58 0%, #451271 50%, #240840 100%)', padding: '3.5rem 1.5rem', color: '#ffffff' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Patient Feedback</div>
            <h2 className="section-title text-white" style={{ fontSize: 'clamp(1.3rem, 4.2vw, 2.4rem)' }}>
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

      {/* ── Video Testimonials Section (Sliding Carousel) ── */}
      <section id="videos" className="section" style={{ background: '#f8fafc', overflow: 'hidden' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Video Stories</div>
            <h2 className="section-title">Review Videos</h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Watch our international and local patients share their complete dental tourism journey and smile results.
            </p>
          </div>

          <div className="video-slider-wrapper" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '0 8px' }}>
            {/* Slider track */}
            <div
              className="video-slider-track"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ overflow: 'hidden', borderRadius: '20px' }}
            >
              <div
                style={{
                  display: 'flex',
                  transform: `translateX(-${activeVideoIdx * 100}%)`,
                  transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  width: '100%',
                }}
              >
                {PATIENT_VIDEOS.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: '0 0 100%',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(69, 18, 113, 0.12)',
                        border: '2px solid rgba(36, 224, 225, 0.3)',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0f0f0f' }}>
                        <iframe
                          src={""}
                          title={item.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', gap: '0.5rem', background: '#ffffff' }}>
                        <span style={{ fontWeight: 700, color: '#451271', fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)' }}>{item.name}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, background: '#24E0E1', color: '#350d58', padding: '0.3rem 0.85rem', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={() => setActiveVideoIdx(prev => (prev > 0 ? prev - 1 : PATIENT_VIDEOS.length - 1))}
              aria-label="Previous Video"
              className="video-slider-arrow video-slider-arrow--prev"
            >
              <ChevronLeft size={22} color="#24E0E1" />
            </button>
            <button
              onClick={() => setActiveVideoIdx(prev => (prev < PATIENT_VIDEOS.length - 1 ? prev + 1 : 0))}
              aria-label="Next Video"
              className="video-slider-arrow video-slider-arrow--next"
            >
              <ChevronRight size={22} color="#24E0E1" />
            </button>

            {/* Slider Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.25rem' }}>
              {PATIENT_VIDEOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVideoIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    width: activeVideoIdx === idx ? '26px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: activeVideoIdx === idx ? '#451271' : '#cbd5e1',
                    border: activeVideoIdx === idx ? '1px solid #24E0E1' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
            <button
              className="btn btn-purple btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => navigate('/online-consultation')}
            >
              Book Your Consultation <ArrowRight size={18} color="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
