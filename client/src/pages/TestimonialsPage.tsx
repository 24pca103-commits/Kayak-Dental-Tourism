import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { testimonialsAPI } from '../services/api';
import type { Testimonial } from '../types';

const DEMO: Testimonial[] = [
  { _id: '1', patientName: 'Priya S.', review: 'I visited KAYAL Multispeciality Dental Care for teeth replacement, and I am extremely happy with the treatment. The clinic is very clean, modern, and equipped with the latest technology. The doctors are patient, friendly, and truly care about your comfort.', rating: 5, status: 'active', createdAt: '' },
  { _id: '2', patientName: 'Karthik R.', review: 'KAYAL Dental Care made me feel comfortable from the moment I walked in. The doctors explained everything clearly, and my smile makeover results were better than I expected. Highly recommend!', rating: 5, status: 'active', createdAt: '' },
  { _id: '3', patientName: 'Meena L.', review: 'Best dental clinic! My daughter was very nervous about her first dental visit, but the pediatric dentist at KAYAL made her feel at ease immediately. Great experience overall.', rating: 5, status: 'active', createdAt: '' },
  { _id: '4', patientName: 'Suresh M.', review: 'I got dental implants done here. The procedure was explained in detail and the post-treatment care was excellent. The implants look and feel completely natural.', rating: 5, status: 'active', createdAt: '' },
  { _id: '5', patientName: 'Deepa K.', review: 'Professional team, modern equipment, and a very hygienic clinic. The teeth whitening treatment gave me amazing results. I feel so much more confident now!', rating: 5, status: 'active', createdAt: '' },
  { _id: '6', patientName: 'Raj N.', review: 'Got my braces treatment done at KAYAL. The orthodontist was exceptional — patient, thorough, and very knowledgeable. My smile has completely transformed.', rating: 5, status: 'active', createdAt: '' },
];

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    document.title = 'Testimonials | KAYAL Dental Care';
    testimonialsAPI.getAll().then(r => setTestimonials(r.data?.data || [])).catch(() => setTestimonials(DEMO));
  }, []);

  const list = testimonials.length > 0 ? testimonials : DEMO;
  const avg = (list.reduce((a, t) => a + t.rating, 0) / list.length).toFixed(1);

  return (
    <div style={{ paddingTop: '70px' }}>
      <section style={{ background: 'linear-gradient(135deg,var(--cyan-600),var(--cyan-500))', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-white" style={{ marginBottom: '1rem' }}>Testimonials</div>
          <h1 className="section-title text-white">What Our Patients Say</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.75rem' }}>Real stories from patients who trusted us with their smiles</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{avg}</div>
              <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', marginTop: '0.2rem' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="white" color="white" />)}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.9 }}>Average Rating</div>
            </div>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{list.length}+</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.9 }}>Happy Patients</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5rem' }}>
            {list.map((t, i) => (
              <div key={t._id || i} style={{ background: 'linear-gradient(135deg,var(--purple-800),var(--purple-700))', borderRadius: 'var(--radius-lg)', padding: '1.75rem', transition: 'transform 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  "{t.review}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan-500),var(--cyan-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'white', flexShrink: 0 }}>
                    {t.patientName.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{t.patientName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
