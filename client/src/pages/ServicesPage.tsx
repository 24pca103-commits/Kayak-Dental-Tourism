import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smile, Filter } from 'lucide-react';
import { servicesAPI } from '../services/api';
import type { Service } from '../types';

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
      <section style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-white" style={{ marginBottom: '1rem' }}>Our Services</div>
          <h1 className="section-title text-white">Comprehensive Dental Services</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>
            From routine check-ups to advanced cosmetic treatments — we cover all your dental needs.
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {list.map(service => (
              <div
                key={service._id}
                onClick={() => navigate(`/services/${service.slug}`)}
                style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', cursor: 'pointer', transition: 'var(--transition)' }}
                className="card"
              >
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,var(--purple-100),var(--cyan-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--purple-600)' }}>
                  <Smile size={24} />
                </div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>{service.name}</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{service.shortDescription}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan-600)' }}>
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            ))}
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
