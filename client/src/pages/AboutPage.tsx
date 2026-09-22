import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  Clock,
  CheckCircle2,
  Camera,
  Activity,
  ShieldCheck,
  Monitor,
  ArrowRight,
  Eye
} from 'lucide-react';
import { doctorsAPI } from '../services/api';
import type { Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';
import '../styles/AboutPage.css';

const DEMO_DOCTORS: Doctor[] = [
  { _id: '0', name: 'Dr. V.Sahaana', qualification: 'BDS., FDS., FMC.', specialization: 'Dental Surgeon Certified & Root Canal Specialist', experience: 10, image: '/assets/dr-kayal-anandhi.jpg', description: 'Dental surgeon certified and root canal specialist dedicated to advanced painless endodontic treatments and comprehensive dental care.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], status: 'active', createdAt: '' },
  { _id: '1', name: 'Dr. Priya Sharma', qualification: 'BDS, MDS', specialization: 'General & Cosmetic Dentist', experience: 12, image: '', description: 'Dr. Priya is a highly experienced general and cosmetic dentist passionate about creating beautiful smiles with personalized patient care.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], status: 'active', createdAt: '' },
  { _id: '2', name: 'Dr. Ramesh Kumar', qualification: 'BDS, MDS (Orthodontics)', specialization: 'Orthodontist', experience: 10, image: '', description: 'Dr. Ramesh specializes in braces and clear aligners, helping patients achieve straighter smiles with modern orthodontic techniques.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], status: 'active', createdAt: '' },
  { _id: '3', name: 'Dr. Anitha Rao', qualification: 'BDS, MDS (Implantology)', specialization: 'Implantologist', experience: 8, image: '', description: 'Dr. Anitha is an expert in dental implants, offering patients a permanent solution for missing teeth with natural-looking results.', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], status: 'active', createdAt: '' },
  { _id: '4', name: 'Dr. Karthik Nair', qualification: 'BDS, MDS (Pediatric)', specialization: 'Pediatric Dentist', experience: 7, image: '', description: "Dr. Karthik specializes in children's dentistry, creating a fun, comfortable environment to build healthy dental habits from an early age.", availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], status: 'active', createdAt: '' },
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [preselectedDoctor, setPreselectedDoctor] = useState('');

  useEffect(() => {
    document.title = 'About Us | KAYAL Dental Care';
    doctorsAPI.getAll().then(r => setDoctors(r.data?.data || [])).catch(() => setDoctors(DEMO_DOCTORS));
  }, []);

  const doctorList = doctors.length > 0 ? doctors : DEMO_DOCTORS;

  const handleBookDoctor = (docName: string) => {
    setPreselectedDoctor(docName);
    setShowModal(true);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { staggerChildren: 0.1 }
  };

  const stats = [
    { icon: <Users size={32} />, value: "5000+", label: "Happy Patients" },
    { icon: <Award size={32} />, value: "15+", label: "Expert Doctors" },
    { icon: <Clock size={32} />, value: "10+", label: "Years Experience" }
  ];

  const facilities = [
    { icon: <Activity size={32} />, title: "Intra Oral Periapical Radio Graph", desc: "High-resolution digital X-rays for precise diagnosis with minimal radiation." },
    { icon: <Camera size={32} />, title: "Intra-oral Camera", desc: "Real-time visual tour of your mouth to help you understand your dental health." },
    { icon: <Monitor size={32} />, title: "Intra-oral Scanner", desc: "Digital impressions without messy molds, perfect for crowns and aligners." },
    { icon: <Monitor size={32} />, title: "Digital X-Ray", desc: "Advanced panoramic imaging for comprehensive treatment planning." },
    { icon: <ShieldCheck size={32} />, title: "Advanced Sterilization", desc: "Class B Autoclave and UV technology ensuring 100% infection control." }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>About Kayal Dental</div>
            <h1>About Kayal Dental Tourism</h1>
            <p>Committed to providing gentle care, advanced technology, and world-class dental treatments for patients across the globe.</p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="section about-story">
        <div className="container">
          <div className="story-grid">
            <motion.div className="story-content" {...fadeInUp}>
              <div className="badge badge-cyan">Our Story</div>
              <h2 className="section-title">A Legacy of Excellence in Dental Care</h2>
              <p>Welcome to Kayal Dental Tourism, where your smile is our top priority. Founded with a vision to make world-class dental care accessible to everyone, we have grown into a trusted destination for patients seeking quality treatments.</p>
              <p>Our philosophy is simple: combine gentle, compassionate care with the most advanced dental technology available. We understand that visiting the dentist can be daunting, which is why we've created a soothing environment where you can feel relaxed and confident in the care you receive.</p>
              <ul className="story-list">
                <li><CheckCircle2 className="text-cyan" size={20} /> Patient-centric approach</li>
                <li><CheckCircle2 className="text-cyan" size={20} /> Painless treatments</li>
                <li><CheckCircle2 className="text-cyan" size={20} /> Transparent pricing</li>
              </ul>
            </motion.div>
            <motion.div className="story-image-wrapper" {...fadeInUp}>
              <div style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(69,18,113,0.2)',
                border: '2.5px solid rgba(36,224,225,0.4)',
                position: 'relative'
              }}>
                {/* Tag INSIDE the card (top-left rounded cyan pill) */}
                <div className="founder-card__badge">
                  <Award size={16} color="#350d58" />
                  <span>Founder &amp; Chief Dental Surgeon</span>
                </div>

                <img
                  src="/assets/about-doctor-founder.jpeg"
                  alt="Dr. V.Sahaana - Founder &amp; Chief Dental Surgeon"
                  className="founder-card__img"
                />

                {/* Bottom info INSIDE the card */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(36,8,64,0.92) 0%, rgba(36,8,64,0.6) 60%, transparent 100%)',
                  padding: '2rem 1.25rem 1rem',
                  color: '#ffffff'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                    Dr. V.Sahaana, BDS., FDS., FMC.
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#24E0E1', fontWeight: 600, marginTop: '3px', lineHeight: 1.45 }}>
                    <div>Dental surgeon certified.</div>
                    <div>Root Canal Specialist</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Stats */}
      <section id="mission" className="section about-mission">
        <div className="container">
          <motion.div className="mission-header text-center" {...fadeInUp} style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title text-white">Creating Smiles Across the Globe</h2>
            <p className="mission-subtitle" style={{ marginTop: '0.75rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>
              Our mission is to be the premier destination for dental tourism, offering uncompromising quality and personalized care.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem clamp(0.5rem, 2vw, 1.25rem)',
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontFamily: 'var(--font-main)',
              fontSize: 'clamp(0.6rem, 2.7vw, 0.9rem)',
              fontWeight: 600,
              border: '1px solid rgba(36, 224, 225, 0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}>
              <Eye size={15} style={{ color: '#24E0E1', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>Vision - Connecting the World Through Confident Smiles.</span>
            </div>
          </motion.div>

          <motion.div
            className="stats-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {stats.map((stat, idx) => (
              <motion.div key={idx} className="stat-card" variants={fadeInUp}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Specialists */}
      <section id="doctors" className="section about-doctors bg-light">
        <div className="container">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <div className="badge badge-purple mb-4">Our Team</div>
            <h2 className="section-title">Meet Our Expert Specialists</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our multidisciplinary team of highly qualified specialists works together to provide comprehensive care tailored to your unique needs.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.75rem' }}>
            {doctorList.map(doc => (
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
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                      {doc.name}{doc.qualification && !doc.name.includes(doc.qualification) ? `, ${doc.qualification}` : ''}
                    </h2>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--purple-600)', margin: '0.2rem 0 0.5rem 0' }}>{doc.specialization}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: 'var(--cyan-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      <Award size={13} />{doc.experience} years experience
                    </div>
                    {doc.description && <p style={{ fontSize: '0.825rem', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '1rem' }}>{doc.description}</p>}
                  </div>
                  <button className="btn btn-primary btn-sm w-full" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#ffffff' }} onClick={() => handleBookDoctor(doc.name)}>
                    Book a Consultation <ArrowRight size={15} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facility & Technology */}
      <section id="facilities" className="section about-facility">
        <div className="container">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <div className="badge badge-cyan mb-4">State-of-the-Art Clinic</div>
            <h2 className="section-title">All Under One Roof</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We utilize the latest advancements in dental technology to ensure precise diagnosis, effective treatments, and maximum comfort.</p>
          </motion.div>

          <motion.div
            className="facility-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {facilities.map((facility, idx) => (
              <motion.div key={idx} className="facility-card card" variants={fadeInUp}>
                <div className="facility-icon-wrapper">
                  {facility.icon}
                </div>
                <h3 className="facility-title">{facility.title}</h3>
                <p className="facility-desc">{facility.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <motion.div className="cta-content text-center" {...fadeInUp}>
            <h2 className="text-white mb-4">Ready to Experience World-Class Dental Care?</h2>
            <p className="text-white mb-8 max-w-2xl mx-auto opacity-90">Schedule your consultation today and take the first step towards a healthier, more beautiful smile.</p>
            <button className="btn btn-cyan btn-lg" onClick={() => navigate('/online-consultation')}>
              <span>Book Online Consultation</span>
              <ArrowRight size={18} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0, minWidth: 18, minHeight: 18 }} />
            </button>
          </motion.div>
        </div>
      </section>
      {showModal && <AppointmentModal onClose={() => { setShowModal(false); setPreselectedDoctor(''); }} services={[]} doctors={doctorList} preselectedDoctor={preselectedDoctor} />}
    </div>
  );
};

export default AboutPage;
