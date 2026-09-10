import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Filter } from 'lucide-react';
import { servicesAPI } from '../services/api';
import type { Service } from '../types';

const SERVICE_IMAGES: Record<string, string> = {
  'teeth-alignment': '/assets/card-orthodontics-hd.jpg',
  'teeth-replacement': '/assets/card-replacement.png',
  'smile-designing': '/assets/card-smile.png',
  'dental-implants': '/assets/treatment-implants-hd.png',
  'root-canal-treatment': '/assets/treatment-5-root-canal.jpg',
  'teeth-whitening': '/assets/treatment-cosmetic-dentistry.jpg',
  'braces': '/assets/card-braces.png',
  'clear-aligners': '/assets/treatment-orthodontics.jpg',
  'pediatric-dentistry': '/assets/treatment-8-pediatric-child.jpg',
  'preventive-dentistry': '/assets/hero-child-smile.png',
  'cosmetic-dentistry': '/assets/treatment-3-cosmetic.png',
  'emergency-dental-care': '/assets/about-clinic-real.jpg',
};

const DEMO_SERVICES: Service[] = [
  { _id: '1', name: 'Teeth Alignment', slug: 'teeth-alignment', shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions for a healthier, confident smile.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '2', name: 'Teeth Replacement', slug: 'teeth-replacement', shortDescription: 'Restore missing teeth with comfortable and natural-looking dental replacement solutions.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '3', name: 'Smile Designing', slug: 'smile-designing', shortDescription: 'Enhance your smile with personalized cosmetic dental treatments designed around your facial features.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '4', name: 'Dental Implants', slug: 'dental-implants', shortDescription: 'Restore missing teeth with permanent titanium implants for a long-lasting natural smile.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '5', name: 'Root Canal Treatment', slug: 'root-canal-treatment', shortDescription: 'Save infected teeth with painless modern root canal therapy using advanced techniques.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '6', name: 'Teeth Whitening', slug: 'teeth-whitening', shortDescription: 'Brighten your smile several shades with professional in-office whitening treatments.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '7', name: 'Braces', slug: 'braces', shortDescription: 'Traditional and ceramic braces for effective, reliable teeth straightening at any age.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '8', name: 'Clear Aligners', slug: 'clear-aligners', shortDescription: 'Nearly invisible aligners for discreet, comfortable orthodontic treatment.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '9', name: 'Pediatric Dentistry', slug: 'pediatric-dentistry', shortDescription: 'Gentle, fun dental care specially designed for children from toddlers to teens.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '10', name: 'Preventive Dentistry', slug: 'preventive-dentistry', shortDescription: 'Regular check-ups, cleaning, and preventive care to maintain optimal oral health.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '11', name: 'Cosmetic Dentistry', slug: 'cosmetic-dentistry', shortDescription: 'Complete cosmetic solutions including veneers, bonding, and aesthetic enhancements.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
  { _id: '12', name: 'Emergency Dental Care', slug: 'emergency-dental-care', shortDescription: 'Prompt care for dental emergencies including toothache, trauma, and broken teeth.', description: '', benefits: [], treatmentProcess: '', whoNeeds: '', duration: '', image: '', status: 'active', createdAt: '' },
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Our Services | KAYAL Dental Care';
    servicesAPI.getAll()
      .then(r => setServices(r.data?.data || []))
      .catch(() => setServices(DEMO_SERVICES));
  }, []);

  const list = (services.length > 0 ? services : DEMO_SERVICES).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '70px' }}>
      {/* Header */}
      <section className="treatment-hero" style={{
        position: 'relative',
        backgroundColor: '#240840',
        backgroundImage: "linear-gradient(90deg, #240840 0%, #240840 28%, rgba(36, 8, 64, 0.92) 42%, rgba(69, 18, 113, 0.5) 65%, rgba(69, 18, 113, 0.1) 85%, transparent 100%), url('/assets/banner-smile-collage-2.jpg')",
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
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Our Treatments</div>
          <h1 className="treatment-hero__title font-display text-white" style={{ textAlign: 'left', margin: '0 0 0.75rem 0', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700 }}>Comprehensive Dental Services</h1>
          <p className="treatment-hero__desc" style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', maxWidth: '620px', textAlign: 'left', fontSize: '1.1rem', lineHeight: 1.6 }}>
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
                      Learn More <ArrowRight size={14} color="#18b8b9" style={{ color: '#18b8b9', stroke: '#18b8b9', flexShrink: 0 }} />
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
