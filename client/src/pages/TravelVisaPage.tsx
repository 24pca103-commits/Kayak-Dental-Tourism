import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, CreditCard, Clock, Plane, MapPin, Star, Languages, DollarSign, Shield, Sun, Coffee, Wifi, Mail } from 'lucide-react';
import './TravelVisaPage.css';

const TravelVisaPage: React.FC = () => {
  return (
    <div className="travel-visa-page">
      <section className="travel-hero">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Travel & Visa Information
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Hassle-free dental trip planning. We guide you every step of the way for a smooth journey to your new smile.
          </motion.p>
        </div>
      </section>

      <section id="visa" className="section visa-guide">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Indian Medical Visa Guide</h2>
            <p>Everything you need to know about getting your medical visa for dental treatment in India.</p>
          </div>

          <div className="visa-steps-grid">
            <motion.div className="visa-step-card" whileHover={{ y: -5 }}>
              <div className="visa-step-icon">
                <CheckCircle size={30} />
              </div>
              <h3>Eligibility</h3>
              <p>Medical visas are available to citizens of most countries who are traveling specifically for medical treatment.</p>
            </motion.div>

            <motion.div className="visa-step-card" whileHover={{ y: -5 }}>
              <div className="visa-step-icon">
                <FileText size={30} />
              </div>
              <h3>Required Documents</h3>
              <ul>
                <li>Valid passport (6+ months)</li>
                <li>Medical invitation letter from Kayal Dental</li>
                <li>Passport-sized photos</li>
                <li>Proof of financial means</li>
                <li>Return tickets</li>
              </ul>
            </motion.div>

            <motion.div className="visa-step-card" whileHover={{ y: -5 }}>
              <div className="visa-step-icon">
                <CreditCard size={30} />
              </div>
              <h3>Application Process</h3>
              <ul>
                <li>Apply online at indianvisaonline.gov.in</li>
                <li>Upload required documents</li>
                <li>Pay the application fees</li>
                <li>Receive your e-visa via email</li>
              </ul>
            </motion.div>

            <motion.div className="visa-step-card" whileHover={{ y: -5 }}>
              <div className="visa-step-icon">
                <Clock size={30} />
              </div>
              <h3>Processing & Validity</h3>
              <ul>
                <li>Processing time: 3-5 business days</li>
                <li>Visa validity: up to 60 days</li>
                <li>Multiple entries often allowed</li>
              </ul>
            </motion.div>
          </div>

          <div id="invitation" className="invitation-section">
            <div className="invitation-icon">
              <Mail size={60} />
            </div>
            <div className="invitation-content">
              <h3>Visa Invitation Letter</h3>
              <p>Kayal Dental provides official medical invitation letters for your visa application. Contact our coordination team with your passport details, and we'll prepare your letter within 24 hours to expedite your visa process.</p>
              <button className="btn btn-purple" style={{ marginTop: '1rem' }}>Request Invitation Letter</button>
            </div>
          </div>
        </div>
      </section>

      <section id="pickup" className="transport-section">
        <div className="container transport-content">
          <div className="transport-text">
            <h2>Airport Pickup & Transport</h2>
            <p>Your comfort is our priority from the moment you land. We provide complimentary VIP airport transfers for all our international patients.</p>
            
            <div className="transport-features">
              <div className="transport-feature">
                <Plane className="transport-feature-icon" />
                <span>Complimentary airport pickup and drop-off</span>
              </div>
              <div className="transport-feature">
                <MapPin className="transport-feature-icon" />
                <span>Pickup from Chennai or Madurai airports</span>
              </div>
              <div className="transport-feature">
                <Star className="transport-feature-icon" />
                <span>Comfortable AC vehicle</span>
              </div>
              <div className="transport-feature">
                <CheckCircle className="transport-feature-icon" />
                <span>Driver with personalized name board</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="hotels" className="section" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Accommodation Partnerships</h2>
            <p>In Partnership with Rebel Packages, we offer specially negotiated rates at trusted hotels near our clinic.</p>
          </div>

          <div className="accommodation-grid">
            <motion.div className="acc-card" whileHover={{ y: -5 }}>
              <div className="acc-header">
                <h3>Budget Comfort</h3>
                <div className="acc-price">~$25 / night</div>
              </div>
              <div className="acc-body">
                <p>Clean, comfortable air-conditioned rooms located conveniently near the clinic.</p>
                <ul className="acc-features">
                  <li><CheckCircle size={16} /> Air conditioning</li>
                  <li><CheckCircle size={16} /> Private bathroom</li>
                  <li><CheckCircle size={16} /> Free WiFi</li>
                  <li><CheckCircle size={16} /> 5-minute walk to clinic</li>
                </ul>
              </div>
            </motion.div>

            <motion.div className="acc-card" whileHover={{ y: -5 }}>
              <div className="acc-header">
                <h3>Standard</h3>
                <div className="acc-price">~$45 / night</div>
              </div>
              <div className="acc-body">
                <p>Excellent 3-star hotels offering great comfort, breakfast, and room service.</p>
                <ul className="acc-features">
                  <li><CheckCircle size={16} /> Complimentary breakfast</li>
                  <li><CheckCircle size={16} /> Room service</li>
                  <li><CheckCircle size={16} /> Laundry services</li>
                  <li><CheckCircle size={16} /> Restaurant on-site</li>
                </ul>
              </div>
            </motion.div>

            <motion.div className="acc-card" whileHover={{ y: -5 }}>
              <div className="acc-header">
                <h3>Premium</h3>
                <div className="acc-price">~$80 / night</div>
              </div>
              <div className="acc-body">
                <p>Luxurious 4-5 star hotels with full amenities for a completely relaxing stay.</p>
                <ul className="acc-features">
                  <li><CheckCircle size={16} /> Premium dining options</li>
                  <li><CheckCircle size={16} /> Swimming pool & gym</li>
                  <li><CheckCircle size={16} /> Spa services</li>
                  <li><CheckCircle size={16} /> Concierge desk</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="tips" className="section">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Local Travel Tips</h2>
            <p>Essential information for your stay in India.</p>
          </div>

          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon"><Languages size={24} /></div>
              <div className="tip-content">
                <h3>Language</h3>
                <p>Tamil is the local language, but English is widely spoken in medical settings and hotels.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon"><DollarSign size={24} /></div>
              <div className="tip-content">
                <h3>Currency</h3>
                <p>Indian Rupee (INR). Cards are widely accepted, and ATMs are readily available.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon"><Shield size={24} /></div>
              <div className="tip-content">
                <h3>Safety</h3>
                <p>India is safe for medical tourists. The clinic area is well-connected and secure.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon"><Sun size={24} /></div>
              <div className="tip-content">
                <h3>Weather</h3>
                <p>Tropical climate. Light, comfortable cotton clothing is highly recommended year-round.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon"><Coffee size={24} /></div>
              <div className="tip-content">
                <h3>Food</h3>
                <p>Wide variety of vegetarian and non-vegetarian options. International cuisine is also available.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon"><Wifi size={24} /></div>
              <div className="tip-content">
                <h3>Communication</h3>
                <p>Buy a local SIM at the airport. WiFi is available at hotels and the clinic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TravelVisaPage;
