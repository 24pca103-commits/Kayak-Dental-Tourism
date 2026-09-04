import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Users, 
  Award, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Activity, 
  ShieldCheck, 
  Monitor, 
  Cpu, 
  ArrowRight
} from 'lucide-react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
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

  const doctors = [
    { name: "Dr. Kayal Anandhi", role: "Founder", specialty: "Implantology & Cosmetic", exp: "15+ yrs", initials: "KA", degree: "BDS MDS Prosthodontics", image: "/assets/dr-kayal-anandhi.jpg" },
    { name: "Dr. Rajesh Kumar", role: "Senior Implantologist", specialty: "Oral Surgery", exp: "12+ yrs", initials: "RK", degree: "BDS MDS" },
    { name: "Dr. Priya Sharma", role: "Cosmetic Dentist", specialty: "Veneers & Smile Design", exp: "10+ yrs", initials: "PS", degree: "BDS" },
    { name: "Dr. Suresh Babu", role: "Orthodontist", specialty: "Braces & Aligners", exp: "8+ yrs", initials: "SB", degree: "BDS MDS" },
    { name: "Dr. Meena Kannan", role: "Endodontist", specialty: "Root Canals", exp: "10+ yrs", initials: "MK", degree: "BDS MDS" },
    { name: "Dr. Arjun Nair", role: "Pediatric Dentist", specialty: "Kids Dental Care", exp: "7+ yrs", initials: "AN", degree: "BDS MDS" }
  ];

  const facilities = [
    { icon: <Activity size={32} />, title: "Intra Oral Periapical Radio Graph", desc: "High-resolution digital X-rays for precise diagnosis with minimal radiation." },
    { icon: <Camera size={32} />, title: "Intra-oral Camera", desc: "Real-time visual tour of your mouth to help you understand your dental health." },
    { icon: <Monitor size={32} />, title: "Intra-oral Scanner", desc: "Digital impressions without messy molds, perfect for crowns and aligners." },
    { icon: <Monitor size={32} />, title: "Digital X-Ray", desc: "Advanced panoramic imaging for comprehensive treatment planning." },
    { icon: <ShieldCheck size={32} />, title: "Advanced Sterilization", desc: "Class B Autoclave and UV technology ensuring 100% infection control." },
    { icon: <Cpu size={32} />, title: "CAD/CAM Technology", desc: "Same-day crowns and bridges designed with computer-aided precision." }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div 
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '50px',
                  background: '#24E0E1',
                  color: '#451271',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-main)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  border: '1.5px solid rgba(255,255,255,0.8)'
                }}>
                  <Award size={16} color="#451271" />
                  <span>Founder &amp; Chief Dental Surgeon</span>
                </div>

                <img
                  src="/assets/about-doctor-founder.png"
                  alt="Dr. Kayal Anandhi - Founder & Chief Dental Surgeon"
                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
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
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-display)', color: '#ffffff' }}>
                    Dr. Kayal Anandhi
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#24E0E1', fontWeight: 600 }}>
                    Founder &amp; Chief Dentist · BDS, MDS (Prosthodontics)
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
          <motion.div className="mission-header text-center" {...fadeInUp}>
            <Globe size={48} className="mission-icon mx-auto" />
            <h2 className="section-title text-white">Creating Smiles Across the Globe</h2>
            <p className="mission-subtitle">Our mission is to be the premier destination for dental tourism, offering uncompromising quality and personalized care.</p>
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

          <motion.div 
            className="doctors-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {doctors.map((doc, idx) => (
              <motion.div key={idx} className="doctor-card card" variants={fadeInUp}>
                <div className="doctor-avatar">
                  {doc.image ? (
                    <img src={doc.image} alt={doc.name} />
                  ) : (
                    <span>{doc.initials}</span>
                  )}
                </div>
                <div className="doctor-info">
                  <h3>{doc.name}</h3>
                  <div className="doctor-degree">{doc.degree}</div>
                  <div className="doctor-role">{doc.role} - {doc.specialty}</div>
                  <div className="doctor-exp badge badge-cyan">{doc.exp} Experience</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
            <h2 className="text-white mb-4">Ready to experience world-class dental care?</h2>
            <p className="text-white mb-8 max-w-2xl mx-auto opacity-90">Schedule your consultation today and take the first step towards a healthier, more beautiful smile.</p>
            <button className="btn btn-cyan btn-lg" onClick={() => navigate('/online-consultation')}>
              Book Consultation <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
