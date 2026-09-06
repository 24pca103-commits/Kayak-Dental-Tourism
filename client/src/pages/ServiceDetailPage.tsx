import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Users, ChevronDown, ChevronUp, ArrowRight, Phone } from 'lucide-react';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';
import './ServiceDetailPage.css';

const SLUG_DATA: Record<string, Partial<Service>> = {
  'dental-implants': {
    name: 'Dental Implants',
    shortDescription: 'Restore missing teeth with permanent titanium implants.',
    description: 'Dental implants are titanium posts surgically placed into the jawbone to act as artificial tooth roots. They provide a strong foundation for fixed or removable replacement teeth that match your natural teeth in appearance and function.',
    benefits: ['Permanent, long-lasting solution', 'Looks and feels completely natural', 'Preserves jawbone and facial structure', 'No impact on adjacent healthy teeth', 'Easy to maintain like natural teeth', 'Improved speech and chewing ability'],
    treatmentProcess: 'Step 1: Comprehensive consultation and imaging → Step 2: Jawbone assessment (bone grafting if needed) → Step 3: Implant placement surgery → Step 4: Healing period (2–6 months for osseointegration) → Step 5: Abutment placement → Step 6: Custom crown fitting',
    whoNeeds: 'Adults with one or more missing teeth due to injury, decay, or gum disease who have sufficient jawbone density and good overall health.',
    duration: '3–6 months total treatment time',
  },
  'teeth-alignment': {
    name: 'Teeth Alignment',
    shortDescription: 'Correct misaligned teeth for a healthier, confident smile.',
    description: 'Teeth alignment treatments correct misaligned, crowded, or spaced teeth using orthodontic solutions tailored to each patient. We offer traditional metal braces, aesthetic ceramic braces, and invisible aligners.',
    benefits: ['Improved bite function', 'Enhanced smile aesthetics', 'Better oral hygiene with straighter teeth', 'Reduced risk of dental decay', 'Boosted self-confidence', 'Long-lasting results with retainer'],
    treatmentProcess: 'Consultation → Dental X-ray & 3D Scan → Custom Treatment Plan → Brace/Aligner Fitting → Regular Adjustments (every 4–6 weeks) → Removal & Retainer Phase',
    whoNeeds: 'Patients of all ages with crowded, spaced, or misaligned teeth seeking functional and aesthetic improvement.',
    duration: '12–24 months depending on severity',
  },
};

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      servicesAPI.getBySlug(slug),
      doctorsAPI.getAll(),
    ]).then(([s, d]) => {
      setService(s.data?.data);
      setDoctors(d.data?.data || []);
    }).catch(() => {
      const demo = SLUG_DATA[slug];
      if (demo) setService({ _id: slug, slug, image: '', status: 'active', createdAt: '', ...demo } as Service);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--gray-400)', fontSize: '1rem' }}>Loading...</div>;
  if (!service) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <p>Service not found.</p>
      <button className="btn btn-purple" onClick={() => navigate('/services')} style={{ marginTop: '1rem' }}>Back to Services</button>
    </div>
  );

  const faqs = [
    { q: `Is ${service.name} painful?`, a: 'Our treatments are performed using modern techniques and appropriate anesthesia to ensure maximum comfort throughout the procedure.' },
    { q: `How long does ${service.name} take?`, a: service.duration || 'The duration varies by individual case. Our specialist will provide a personalized timeline after your initial consultation.' },
    { q: `How much does ${service.name} cost?`, a: 'Treatment costs vary based on individual requirements. We offer transparent pricing and flexible payment options. Contact us for a detailed quote.' },
    { q: `What is the recovery time?`, a: 'Recovery varies by treatment. Our team will provide detailed post-treatment care instructions to ensure smooth and quick healing.' },
  ];

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '3rem 1.5rem' }}>
        <div className="container">
          <button onClick={() => navigate('/services')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0 }}>
            <ArrowLeft size={16} /> Back to Services
          </button>
          <h1 className="section-title text-white">{service.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem', maxWidth: 600 }}>{service.shortDescription}</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }} onClick={() => setShowModal(true)}>
            Book Appointment <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="service-detail-grid">
            <div>
              {/* Description */}
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1rem' }}>What is {service.name}?</h2>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{service.description || service.shortDescription}</p>

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1rem' }}>Key Benefits</h2>
                  <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', listStyle: 'none' }}>
                    {service.benefits.map((b, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                        <CheckCircle size={16} style={{ color: 'var(--cyan-500)', flexShrink: 0, marginTop: 2 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Process */}
              {service.treatmentProcess && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1rem' }}>Treatment Process</h2>
                  <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{service.treatmentProcess}</p>
                </div>
              )}

              {/* Who Needs */}
              {service.whoNeeds && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '0.75rem' }}>Who Needs This?</h2>
                  <div style={{ background: 'var(--purple-50)', border: '1.5px solid var(--purple-100)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Users size={18} style={{ color: 'var(--purple-600)', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.7 }}>{service.whoNeeds}</p>
                  </div>
                </div>
              )}

              {/* FAQ */}
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {faqs.map((faq, i) => (
                    <div key={i} style={{ border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: openFaq === i ? 'var(--purple-50)' : 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: openFaq === i ? 'var(--purple-700)' : 'var(--gray-800)', textAlign: 'left', gap: '1rem' }}
                      >
                        <span>{faq.q}</span>
                        {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {openFaq === i && (
                        <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg,var(--purple-700),var(--purple-800))', borderRadius: 'var(--radius-lg)', padding: '1.75rem', color: 'white' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Book This Treatment</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', lineHeight: 1.6 }}>Ready to get started? Book your consultation with our specialist today.</p>
                <button className="btn btn-primary w-full" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setShowModal(true)}>
                  Book Appointment <ArrowRight size={16} color="#451271" style={{ color: '#451271', stroke: '#451271', flexShrink: 0 }} />
                </button>
              </div>

              {service.duration && (
                <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--cyan-500)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)' }}>Treatment Duration</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{service.duration}</p>
                </div>
              )}

              <div style={{ background: 'var(--cyan-50)', border: '1.5px solid var(--cyan-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cyan-700)', marginBottom: '0.4rem' }}>Need help deciding?</p>
                <p style={{ fontSize: '0.825rem', color: 'var(--gray-600)' }}>Call us and speak to a dental expert.</p>
                <a href="tel:+919876543210" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#451271" style={{ color: '#451271', stroke: '#451271', flexShrink: 0 }} /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} services={[]} doctors={doctors} preselectedService={service.name} />}
    </div>
  );
};

export default ServiceDetailPage;
