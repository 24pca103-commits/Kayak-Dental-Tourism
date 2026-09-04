import React, { useState, useEffect } from 'react';
import { Award, Users, Star } from 'lucide-react';
import { doctorsAPI } from '../services/api';
import type { Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';

const DEMO: Doctor[] = [
  { _id: '0', name: 'Dr. Kayal Anandhi', qualification: 'BDS, MDS (Prosthodontics)', specialization: 'Founder & Chief Implantologist', experience: 15, image: '/assets/dr-kayal-anandhi.jpg', description: 'Founder and chief dental surgeon with over 15 years of excellence in dental implantology, cosmetic smile makeovers, and international patient care.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'active', createdAt: '' },
  { _id: '1', name: 'Dr. Priya Sharma', qualification: 'BDS, MDS', specialization: 'General & Cosmetic Dentist', experience: 12, image: '', description: 'Dr. Priya is a highly experienced general and cosmetic dentist passionate about creating beautiful smiles with personalized patient care.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'active', createdAt: '' },
  { _id: '2', name: 'Dr. Ramesh Kumar', qualification: 'BDS, MDS (Orthodontics)', specialization: 'Orthodontist', experience: 10, image: '', description: 'Dr. Ramesh specializes in braces and clear aligners, helping patients achieve straighter smiles with modern orthodontic techniques.', availability: ['Mon', 'Wed', 'Fri', 'Sat'], status: 'active', createdAt: '' },
  { _id: '3', name: 'Dr. Anitha Rao', qualification: 'BDS, MDS (Implantology)', specialization: 'Implantologist', experience: 8, image: '', description: 'Dr. Anitha is an expert in dental implants, offering patients a permanent solution for missing teeth with natural-looking results.', availability: ['Tue', 'Thu', 'Sat'], status: 'active', createdAt: '' },
  { _id: '4', name: 'Dr. Karthik Nair', qualification: 'BDS, MDS (Pediatric)', specialization: 'Pediatric Dentist', experience: 7, image: '', description: "Dr. Karthik specializes in children's dentistry, creating a fun, comfortable environment to build healthy dental habits from an early age.", availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], status: 'active', createdAt: '' },
];

const TeamPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = 'Our Team | KAYAL Dental Care';
    doctorsAPI.getAll().then(r => setDoctors(r.data?.data || [])).catch(() => setDoctors(DEMO));
  }, []);

  const list = doctors.length > 0 ? doctors : DEMO;

  return (
    <div style={{ paddingTop: '70px' }}>
      <section style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-white" style={{ marginBottom: '1rem' }}>Our Specialists</div>
          <h1 className="section-title text-white">Meet Our Expert Dental Team</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem' }}>Experienced, caring professionals dedicated to your oral health and confidence</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.75rem' }}>
            {list.map(doc => (
              <div key={doc._id} style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'var(--transition)', display: 'flex', flexDirection: 'column', height: '100%' }} className="card">
                <div style={{ height: 200, background: 'linear-gradient(135deg,var(--purple-50),var(--cyan-50))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                  {doc.image ? (
                    <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Users size={56} style={{ color: 'var(--purple-300)' }} />
                  )}
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'var(--cyan-500)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {doc.specialization.split(' ')[0]}
                  </div>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ flexGrow: 1 }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-800)' }}>{doc.name}</h2>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--purple-600)', margin: '0.2rem 0' }}>{doc.specialization}</p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>{doc.qualification}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--cyan-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      <Award size={13} />{doc.experience} years experience
                    </div>
                    {doc.description && <p style={{ fontSize: '0.825rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>{doc.description}</p>}
                    {doc.availability.length > 0 && (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.4rem' }}>Available:</p>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {doc.availability.map(d => (
                            <span key={d} style={{ padding: '0.2rem 0.5rem', background: 'var(--purple-50)', color: 'var(--purple-600)', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px' }}>{d.slice(0,3)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm w-full" style={{ marginTop: 'auto' }} onClick={() => setShowModal(true)}>
                    Book with {doc.name.split(' ')[1]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why our team */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>
            Why Our <span style={{ color: 'var(--purple-600)' }}>Team Stands Out</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Star size={24} />, title: 'Highly Qualified', desc: 'All doctors hold recognized degrees and specialized training.' },
              { icon: <Award size={24} />, title: 'Years of Experience', desc: 'Combined 40+ years of dental expertise across all specializations.' },
              { icon: <Users size={24} />, title: 'Patient-First Approach', desc: 'Every patient receives personalized attention and compassionate care.' },
              { icon: <Star size={24} fill="currentColor" style={{ color: '#fbbf24' }} />, title: '5-Star Rated', desc: 'Consistently rated 5 stars by thousands of satisfied patients.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--purple-100),var(--cyan-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', margin: '0 auto 1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <button className="btn btn-purple btn-lg" style={{ marginTop: '2.5rem' }} onClick={() => setShowModal(true)}>
            Book an Appointment
          </button>
        </div>
      </section>

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} services={[]} doctors={list} />}
    </div>
  );
};

export default TeamPage;
