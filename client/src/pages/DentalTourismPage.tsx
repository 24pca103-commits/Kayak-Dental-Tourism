import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  MapPin, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  PlayCircle,
  Video,
  FileText,
  Hospital,
  HeartPulse,
  MessageCircle
} from 'lucide-react';
import './DentalTourismPage.css';

const costData = [
  { treatment: 'Single Implant', india: 500, usa: 3000, uk: 2500, uae: 2000, max: 3000 },
  { treatment: 'Full Mouth Rehab', india: 3000, usa: 20000, uk: 15000, uae: 12000, max: 20000 },
  { treatment: 'Zirconia Crown', india: 150, usa: 1200, uk: 800, uae: 600, max: 1200 },
  { treatment: 'Root Canal + Crown', india: 200, usa: 2000, uk: 1500, uae: 1000, max: 2000 },
  { treatment: 'Smile Makeover', india: 2000, usa: 15000, uk: 12000, uae: 8000, max: 15000 },
];

const journeySteps = [
  { id: 1, title: 'Free Consultation', desc: 'Share dental concerns via video call or WhatsApp', icon: <Video className="w-6 h-6" /> },
  { id: 2, title: 'Treatment Plan', desc: 'Receive detailed plan with costs and timeline', icon: <FileText className="w-6 h-6" /> },
  { id: 3, title: 'Travel & Arrival', desc: 'We assist with visa, flights, airport pickup', icon: <Plane className="w-6 h-6" /> },
  { id: 4, title: 'Treatment', desc: 'World-class treatment at state-of-the-art facility', icon: <Hospital className="w-6 h-6" /> },
  { id: 5, title: 'Recovery & Explore', desc: 'Heal while enjoying India\'s culture', icon: <MapPin className="w-6 h-6" /> },
  { id: 6, title: 'Follow-up Care', desc: 'Virtual follow-ups after you return', icon: <HeartPulse className="w-6 h-6" /> },
];

const qualityStandards = [
  { id: 1, title: 'ISO 9001 Certified', icon: <Award className="w-8 h-8 text-cyan-400" /> },
  { id: 2, title: 'International-grade sterilization', icon: <ShieldCheck className="w-8 h-8 text-cyan-400" /> },
  { id: 3, title: 'Premium implant systems', icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" />, sub: 'Nobel Biocare, Straumann' },
  { id: 4, title: 'Digital imaging & planning', icon: <Award className="w-8 h-8 text-cyan-400" /> },
  { id: 5, title: 'Multilingual staff', icon: <MessageCircle className="w-8 h-8 text-cyan-400" /> },
  { id: 6, title: '98% implant success rate', icon: <CheckCircle2 className="w-8 h-8 text-cyan-400" /> },
];

const testimonials = [
  { id: 1, name: 'James Wilson', country: 'UK', treatment: 'Full Mouth Implants', rating: 5, text: 'Saved 70% vs UK prices', hasVideo: true },
  { id: 2, name: 'Sarah Mitchell', country: 'USA', treatment: 'Smile Makeover', rating: 5, text: 'Perfectly organized', hasVideo: false },
  { id: 3, name: 'Ahmed Al-Rashid', country: 'UAE', treatment: 'Dental Implants', rating: 5, text: 'Painless and amazing', hasVideo: true },
  { id: 4, name: 'Maria González', country: 'Spain', treatment: 'Zirconia Crowns', rating: 5, text: 'Stunning results', hasVideo: false },
];

const DentalTourismPage: React.FC = () => {
  return (
    <div className="dental-tourism-page">
      {/* 1. Hero */}
      <section id="why-india" className="hero-section">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title font-display">Why Choose India for Dental Care</h1>
            <p className="hero-subtitle">World-class dental treatments at a fraction of the cost, combining your smile transformation with a memorable vacation.</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">70%</span>
                <span className="stat-text">Cost Savings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-text">International Patients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-text">Success Rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Cost Comparison */}
      <section id="cost-comparison" className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title font-display">Transparent Cost Comparison</h2>
            <p className="section-subtitle">See why thousands travel to India for their dental care</p>
            <span className="badge badge-cyan mt-4 inline-block">Save up to 70%</span>
          </div>

          <div className="cost-chart-container">
            {costData.map((item, index) => (
              <motion.div 
                key={index} 
                className="cost-row"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="cost-treatment-name">{item.treatment}</div>
                <div className="cost-bars">
                  <div className="cost-bar-group">
                    <span className="cost-label">India</span>
                    <motion.div 
                      className="bar bar-india" 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.india / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                      <span className="bar-value">${item.india}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">USA</span>
                    <motion.div 
                      className="bar bar-usa" 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.usa / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <span className="bar-value">${item.usa}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">UK</span>
                    <motion.div 
                      className="bar bar-uk" 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.uk / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4 }}
                    >
                      <span className="bar-value">${item.uk}</span>
                    </motion.div>
                  </div>
                  <div className="cost-bar-group">
                    <span className="cost-label">UAE</span>
                    <motion.div 
                      className="bar bar-uae" 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(item.uae / item.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      <span className="bar-value">${item.uae}</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Patient Journey Timeline */}
      <section id="journey" className="section bg-light-gray">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title font-display">Your Journey With Us</h2>
            <p className="section-subtitle">A seamless experience from consultation to recovery</p>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            {journeySteps.map((step, index) => (
              <motion.div 
                key={step.id} 
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="timeline-circle">
                  {step.id}
                </div>
                <div className="timeline-content card">
                  <div className="timeline-icon-wrap">
                    {step.icon}
                  </div>
                  <h3 className="timeline-title">{step.title}</h3>
                  <p className="timeline-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Quality & Safety Standards */}
      <section id="safety" className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title font-display">World-Class Quality & Safety</h2>
            <p className="section-subtitle">We never compromise on international standards</p>
          </div>

          <div className="standards-grid">
            {qualityStandards.map((item) => (
              <motion.div 
                key={item.id} 
                className="standard-card card"
                whileHover={{ y: -5 }}
              >
                <div className="standard-icon">
                  {item.icon}
                </div>
                <h3 className="standard-title">{item.title}</h3>
                {item.sub && <p className="standard-sub">{item.sub}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Patient Testimonials */}
      <section id="testimonials" className="section bg-light-gray">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title font-display">Global Success Stories</h2>
            <p className="section-subtitle">Hear from our international patients</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testi, index) => (
              <motion.div 
                key={testi.id} 
                className="testimonial-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="testimonial-header">
                  <div>
                    <h3 className="testimonial-name">{testi.name}</h3>
                    <p className="testimonial-country">{testi.country} • {testi.treatment}</p>
                  </div>
                  {testi.hasVideo && (
                    <button className="play-btn" aria-label="Play video testimonial">
                      <PlayCircle className="w-8 h-8" />
                    </button>
                  )}
                </div>
                <div className="testimonial-rating">
                  {[...Array(testi.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="testimonial-text">"{testi.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2 className="font-display">Ready to Transform Your Smile?</h2>
            <p>Get a free personalized treatment plan and cost estimate today.</p>
            <div className="cta-buttons">
              <Link to="/online-consultation" className="btn btn-primary">
                Book Consultation
              </Link>
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="btn btn-outline-light">
                <MessageCircle className="w-5 h-5 mr-2 inline" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DentalTourismPage;
