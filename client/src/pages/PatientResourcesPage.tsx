import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Check, ShieldCheck, Sparkles, HeartPulse, Smile, CheckCircle2, Lock,
  FileText, CheckCircle, CreditCard, Clock, Plane, MapPin, Star, Languages, DollarSign, Shield, Sun, Coffee, Wifi, Mail, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './PatientResourcesPage.css';
import './TravelVisaPage.css';

const PatientResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'medical' | 'travel' | 'payment'>('medical');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const beforeTravelChecklist = [
    { id: 'bt1', label: "Complete online consultation with Kayal Dental" },
    { id: 'bt2', label: "Receive and review your treatment plan" },
    { id: 'bt3', label: "Apply for Medical Visa (if required)" },
    { id: 'bt4', label: "Book flights and accommodation" },
    { id: 'bt5', label: "Gather medical records and recent X-rays" },
    { id: 'bt6', label: "List current medications and allergies" },
    { id: 'bt7', label: "Arrange travel insurance" },
    { id: 'bt8', label: "Download Kayal Dental contact information" }
  ];

  const dayBeforeChecklist = [
    { id: 'db1', label: "Avoid alcohol 24 hours before surgery" },
    { id: 'db2', label: "Get good rest the night before" },
    { id: 'db3', label: "Prepare loose, comfortable clothing" },
    { id: 'db4', label: "Keep documents and ID ready" }
  ];

  // Combined full order of checklist items
  const allOrderedItems = [...beforeTravelChecklist, ...dayBeforeChecklist];

  const toggleChecklist = (id: string) => {
    const itemIndex = allOrderedItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const isCurrentlyChecked = !!checklist[id];

    if (!isCurrentlyChecked) {
      // User is trying to CHECK this item: verify all previous items are checked first
      for (let i = 0; i < itemIndex; i++) {
        const prevId = allOrderedItems[i].id;
        if (!checklist[prevId]) {
          toast.error(`Please complete Step ${i + 1}: "${allOrderedItems[i].label}" first!`, {
            duration: 3500,
            id: 'checklist-order-toast',
          });
          return;
        }
      }
      setChecklist(prev => ({ ...prev, [id]: true }));
    } else {
      // User is UNCHECKING: verify no subsequent items are already checked
      for (let i = itemIndex + 1; i < allOrderedItems.length; i++) {
        const nextId = allOrderedItems[i].id;
        if (checklist[nextId]) {
          toast.error(`Please uncheck subsequent steps first starting from Step ${i + 1}`, {
            duration: 3500,
            id: 'checklist-order-toast',
          });
          return;
        }
      }
      setChecklist(prev => ({ ...prev, [id]: false }));
    }
  };

  const faqs = {
    medical: [
      { question: "Is dental care quality comparable to Western countries?", answer: "Yes, our dentists are internationally trained, and we use the exact same globally recognized materials and technology as top clinics in the US, UK, and Australia." },
      { question: "How long will I need to stay?", answer: "Treatment durations vary, but most procedures like implants or full mouth restorations require a stay of 5-14 days. We provide precise timelines during your virtual consultation." },
      { question: "Are materials same quality?", answer: "Absolutely. We exclusively use premium, FDA-approved materials from world-leading brands including Nobel Biocare, Straumann, and Ivoclar." },
      { question: "Will I have a dedicated coordinator?", answer: "Yes, from your first inquiry to your journey home, a dedicated patient coordinator will assist you with planning, logistics, and any questions." },
      { question: "What about follow-up care?", answer: "We offer virtual follow-up consultations and will coordinate with your local dentist if any minor adjustments are needed back home." }
    ],
    travel: [
      { question: "Do I need special visa?", answer: "Most international patients require a Medical Visa. We provide an official medical invitation letter to expedite your application process." },
      { question: "Airport pickup?", answer: "Yes, we provide complimentary, comfortable airport pickup and drop-off for all our international patients." },
      { question: "Accommodation?", answer: "We partner with local hotels ranging from budget comfort to 5-star premium, offering special rates exclusively for Kayal Dental patients." },
      { question: "Is it safe?", answer: "India welcomes millions of medical tourists annually. Our clinic is located in a very safe, well-connected, and tourist-friendly area." }
    ],
    payment: [
      { question: "Payment methods?", answer: "We accept all major international credit/debit cards, bank wire transfers, and cash payments in major currencies." },
      { question: "Insurance reimbursement?", answer: "While we do not bill international insurance directly, we provide detailed invoices, treatment codes, and documentation for you to claim reimbursement." },
      { question: "Financing?", answer: "Yes, we offer flexible payment plans. Please discuss this with your coordinator during the consultation phase." },
      { question: "Hidden costs?", answer: "Never. We pride ourselves on transparent, all-inclusive quotes provided before you even book your flight." }
    ]
  };

  const careGuides = [
    {
      title: "After Dental Implants",
      badge: "Dental Implants",
      icon: ShieldCheck,
      content: [
        "Maintain a soft food diet for 2 weeks",
        "Use gentle brushing around the implant site",
        "Strictly avoid smoking as it hinders healing",
        "Take prescribed antibiotics and pain medication as directed",
        "Attend all scheduled follow-up appointments"
      ]
    },
    {
      title: "After Crowns & Bridges",
      badge: "Crowns & Bridges",
      icon: Sparkles,
      content: [
        "Avoid hard or sticky foods for the first 24 hours",
        "Mild temperature sensitivity is normal for a few days",
        "Maintain normal, thorough oral hygiene (brushing & flossing)",
        "Contact us if your bite feels uneven"
      ]
    },
    {
      title: "After Root Canal",
      badge: "Root Canal",
      icon: HeartPulse,
      content: [
        "Avoid chewing on the treated side until a permanent crown is placed",
        "Mild pain or swelling is normal for a few days",
        "Complete the full course of prescribed antibiotics",
        "Take over-the-counter pain relievers as needed"
      ]
    },
    {
      title: "After Cosmetic Procedures",
      badge: "Cosmetic Dentistry",
      icon: Smile,
      content: [
        "Avoid staining foods and drinks (coffee, tea, wine) for 48 hours",
        "Use desensitizing toothpaste if you experience sensitivity",
        "Follow the specific whitening maintenance guide provided",
        "Use a soft-bristled toothbrush"
      ]
    },
    {
      title: "General Guidelines",
      badge: "General Care",
      icon: CheckCircle2,
      content: [
        "Keep our emergency contact information easily accessible",
        "Schedule your virtual follow-up appointment before leaving",
        "Maintain regular 6-month dental visits back home",
        "Reach out immediately if you experience severe pain or swelling"
      ]
    }
  ];

  return (
    <div className="patient-resources-page">
      <section className="resources-hero">
        <div className="container" style={{ textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Patient Resources &amp; Guides</div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'left', margin: '0 0 0.75rem 0', color: '#ffffff' }}
          >
            Patient Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ textAlign: 'left', margin: '0', maxWidth: '620px', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', lineHeight: 1.6 }}
          >
            Everything you need to prepare for your dental journey and maintain your beautiful new smile.
          </motion.p>
        </div>
      </section>

      <section id="faqs" className="section bg-white">
        <div className="container">
          <div className="text-center mb-5" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p>Find answers to common questions about treatment, travel, and payments.</p>
          </div>

          <div className="faq-tabs">
            <button 
              className={`faq-tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
              onClick={() => { setActiveTab('medical'); setOpenFaq(null); }}
            >
              Medical & Treatment
            </button>
            <button 
              className={`faq-tab-btn ${activeTab === 'travel' ? 'active' : ''}`}
              onClick={() => { setActiveTab('travel'); setOpenFaq(null); }}
            >
              Travel & Logistics
            </button>
            <button 
              className={`faq-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => { setActiveTab('payment'); setOpenFaq(null); }}
            >
              Costs & Payment
            </button>
          </div>

          <div className="faq-accordion">
            {faqs[activeTab].map((faq, index) => (
              <div key={index} className="accordion-item">
                <div 
                  className={`accordion-header ${openFaq === index ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.question}
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className={`accordion-content ${openFaq === index ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="checklist" className="section">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Pre-Treatment Checklist</h2>
            <p>Track your preparation to ensure a smooth and stress-free journey.</p>
          </div>

          <div className="checklist-container">
            <div className="checklist-box">
              <h3>Before You Travel</h3>
              {beforeTravelChecklist.map((item, idx) => {
                const globalIndex = allOrderedItems.findIndex(i => i.id === item.id);
                const isChecked = !!checklist[item.id];
                const isLocked = globalIndex > 0 && !checklist[allOrderedItems[globalIndex - 1].id] && !isChecked;

                return (
                  <div 
                    key={item.id} 
                    className={`checklist-item ${isLocked ? 'checklist-item--locked' : ''}`}
                    onClick={() => toggleChecklist(item.id)}
                    title={isLocked ? `Complete Step ${globalIndex} first` : undefined}
                  >
                    <div className={`checkbox-custom ${isChecked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
                      {isChecked ? (
                        <Check size={16} strokeWidth={3} />
                      ) : isLocked ? (
                        <Lock size={12} color="#9ca3af" />
                      ) : (
                        <span className="checklist-step-num">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`checklist-label ${isChecked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="checklist-box">
              <h3>Day Before Treatment</h3>
              {dayBeforeChecklist.map((item, idx) => {
                const globalIndex = allOrderedItems.findIndex(i => i.id === item.id);
                const isChecked = !!checklist[item.id];
                const isLocked = globalIndex > 0 && !checklist[allOrderedItems[globalIndex - 1].id] && !isChecked;

                return (
                  <div 
                    key={item.id} 
                    className={`checklist-item ${isLocked ? 'checklist-item--locked' : ''}`}
                    onClick={() => toggleChecklist(item.id)}
                    title={isLocked ? `Complete Step ${globalIndex} first` : undefined}
                  >
                    <div className={`checkbox-custom ${isChecked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
                      {isChecked ? (
                        <Check size={16} strokeWidth={3} />
                      ) : isLocked ? (
                        <Lock size={12} color="#9ca3af" />
                      ) : (
                        <span className="checklist-step-num">{beforeTravelChecklist.length + idx + 1}</span>
                      )}
                    </div>
                    <span className={`checklist-label ${isChecked ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="care-guide" className="section bg-white">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Recovery Guidelines</div>
            <h2 className="section-title">Post-Treatment Care Guide</h2>
            <p style={{ color: 'var(--gray-600)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
              Follow these specialist guidelines to ensure fast healing, maximum comfort, and long-lasting results.
            </p>
          </div>

          <div className="care-guide-grid">
            {careGuides.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <div key={index} className="care-card-v2">
                  <div className="care-card-v2__header">
                    <div className="care-card-v2__icon-box">
                      <IconComponent size={24} color="#451271" stroke="#451271" style={{ color: '#451271', stroke: '#451271' }} />
                    </div>
                    <div>
                      <span className="care-card-v2__badge">{guide.badge}</span>
                      <h3 className="care-card-v2__title">{guide.title}</h3>
                    </div>
                  </div>
                  <div className="care-card-v2__body">
                    <ul className="care-card-v2__list">
                      {guide.content.map((point, i) => (
                        <li key={i} className="care-card-v2__item">
                          <CheckCircle2 size={16} className="care-card-v2__check" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Travel & Visa Guide Section ── */}
      <section id="visa" className="section visa-guide">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Visa Assistance</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Indian Medical Visa Guide</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>Everything you need to know about getting your medical visa for dental treatment in India.</p>
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
              <h3>Processing &amp; Validity</h3>
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
              <p style={{ textIndent: '2.5rem' }}>Kayal Dental provides official medical invitation letters for your visa application. Contact our coordination team with your passport details, and we'll prepare your letter within 24 hours to expedite your visa process.</p>
              <button
                className="btn btn-purple"
                style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                onClick={() => navigate('/online-consultation')}
              >
                Request Invitation Letter <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Airport Pickup & Transport Section ── */}
      <section id="pickup" className="transport-section">
        <div className="container transport-content">
          <div className="transport-text">
            <h2 style={{ textAlign: 'center' }}>Airport Pickup &amp; Transport</h2>
            <p className="transport-desc" style={{ textAlign: 'justify', textJustify: 'inter-word', textAlignLast: 'left', textIndent: '2.5rem' }}>Your comfort is our priority from the moment you land. We provide complimentary VIP airport transfers for all our international patients.</p>
            
            <div className="transport-features">
              <div className="transport-feature">
                <Plane className="transport-feature-icon" />
                <span>Complimentary airport pickup and drop-off</span>
              </div>
              <div className="transport-feature">
                <MapPin className="transport-feature-icon" />
                <span>Pickup from Coimbatore International Airport (CJB)</span>
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

      {/* ── Accommodation Partnerships ── */}
      <section id="hotels" className="section" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Hotel Stays</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Accommodation Partnerships</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>We offer specially negotiated rates at trusted hotels near our clinic.</p>
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
                  <li><CheckCircle size={16} /> Swimming pool &amp; gym</li>
                  <li><CheckCircle size={16} /> Spa services</li>
                  <li><CheckCircle size={16} /> Concierge desk</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Local Travel Tips ── */}
      <section id="tips" className="section">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Local Insights</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Local Travel Tips</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>Essential information for your stay in India.</p>
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

export default PatientResourcesPage;
