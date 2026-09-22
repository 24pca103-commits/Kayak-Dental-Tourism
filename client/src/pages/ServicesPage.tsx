import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Filter } from 'lucide-react';
import { servicesAPI } from '../services/api';
import type { Service } from '../types';

const SERVICE_IMAGES: Record<string, string> = {
  'dental-implants': '/assets/about-clinic-real.jpg',
  'full-mouth-rehabilitation': '/assets/treatment-2-rehab.jpg',
  'cosmetic-dentistry': '/assets/treatment-3-cosmetic.png',
  'crowns-and-bridges': '/assets/treatment-4-crowns.jpg',
  'root-canal-treatment': '/assets/treatment-5-root-canal.jpg',
  'teeth-alignment': '/assets/card-orthodontics-hd.jpg',
  'braces': '/assets/treatment-orthodontics.jpg',
  'clear-aligners': '/assets/card-braces.png',
  'oral-surgery': '/assets/treatment-7-oral-surgery.jpg',
  'pediatric-dentistry': '/assets/treatment-8-pediatric-child.jpg',
};

const DEMO_SERVICES: Service[] = [
  { _id: '1', name: 'Dental Implants', slug: 'dental-implants', shortDescription: 'Permanent titanium tooth replacements that look, feel, and function 100% naturally.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '2', name: 'Full Mouth Rehabilitation', slug: 'full-mouth-rehabilitation', shortDescription: 'Complete smile restoration combining implants, crowns, and digital 3D smile design.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '3', name: 'Cosmetic Dentistry', slug: 'cosmetic-dentistry', shortDescription: 'Transform your smile with porcelain veneers, smile makeovers, and whitening.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '4', name: 'Crowns & Bridges', slug: 'crowns-and-bridges', shortDescription: 'Premium Zirconia and PFM restorations engineered for maximum strength.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '5', name: 'Root Canal Treatment', slug: 'root-canal-treatment', shortDescription: 'Painless single-visit endodontic therapy designed to save your natural teeth.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '6', name: 'Teeth Alignment', slug: 'teeth-alignment', shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions for a healthier, confident smile.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '7', name: 'Braces', slug: 'braces', shortDescription: 'Traditional and ceramic braces for effective, reliable teeth straightening at any age.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '8', name: 'Clear Aligners', slug: 'clear-aligners', shortDescription: 'Nearly invisible aligners for discreet, comfortable orthodontic treatment.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '9', name: 'Oral & Maxillofacial Surgery', slug: 'oral-surgery', shortDescription: 'Expert surgical solutions for complex wisdom teeth, jaw, and facial conditions.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '10', name: 'Pediatric Dentistry', slug: 'pediatric-dentistry', shortDescription: 'Gentle, painless, and fun dental care tailored specifically for children.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Our Treatments | KAYAL Dental Care';
    servicesAPI.getAll()
      .then(r => {
        const fetched: Service[] = r.data?.data || [];
        const validSlugs = new Set(DEMO_SERVICES.map(s => s.slug));
        const filtered = fetched.filter(s => validSlugs.has(s.slug));
        if (filtered.length >= 10) {
          setServices(filtered);
        } else {
          setServices(DEMO_SERVICES);
        }
      })
      .catch(() => setServices(DEMO_SERVICES));
  }, []);

  const list = (services.length > 0 ? services : DEMO_SERVICES).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* Header */}
      <section className="treatment-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Our Treatments</div>
          <h1 className="treatment-hero__title font-display text-white" style={{ textAlign: 'left', margin: '0 0 0.75rem 0', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)' }}>Comprehensive Dental Services</h1>
          <p className="treatment-hero__desc" style={{ color: 'rgba(255,255,255,0.95)', marginTop: '0', maxWidth: '620px', textAlign: 'left', fontSize: '1.1rem', lineHeight: 1.6, textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
            From routine check-ups to advanced cosmetic transformations — we provide world-class dental care with gentle hands.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 400, margin: '0 auto 2.5rem', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: '50px', padding: '0.5rem 1rem' }}>
            <Filter size={16} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'none', flex: 1, fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.75rem' }}>
            {list.map(service => {
              const imgSrc = SERVICE_IMAGES[service.slug] || service.image || '/assets/about-clinic-real.jpg';

              return (
                <div
                  key={service._id}
                  onClick={() => navigate(`/services/${service.slug}`)}
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--gray-100)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  className="card"
                >
                  <div style={{ height: 180, width: '100%', overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                    <img
                      src={imgSrc}
                      alt={service.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>{service.name}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '1.25rem', flexGrow: 1 }}>{service.shortDescription}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan-600)', marginTop: 'auto' }}>
                      Learn More <ArrowRight size={14} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
              No services found matching "{search}"
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
