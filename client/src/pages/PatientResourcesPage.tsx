import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import './PatientResourcesPage.css';

const PatientResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medical' | 'travel' | 'payment'>('medical');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [openCare, setOpenCare] = useState<number | null>(null);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
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

  const careGuides = [
    {
      title: "After Dental Implants",
      content: [
        "Maintain a soft food diet for 2 weeks",
        "Use gentle brushing around the implant site",
        "Strictly avoid smoking as it hinders healing",
        "Take prescribed antibiotics and pain medication as directed",
        "Attend all scheduled follow-up appointments"
      ]
    },
    {
      title: "After Crowns/Bridges",
      content: [
        "Avoid hard or sticky foods for the first 24 hours",
        "Mild temperature sensitivity is normal for a few days",
        "Maintain normal, thorough oral hygiene (brushing & flossing)",
        "Contact us if your bite feels uneven"
      ]
    },
    {
      title: "After Root Canal",
      content: [
        "Avoid chewing on the treated side until a permanent crown is placed",
        "Mild pain or swelling is normal for a few days",
        "Complete the full course of prescribed antibiotics",
        "Take over-the-counter pain relievers as needed"
      ]
    },
    {
      title: "After Cosmetic Procedures",
      content: [
        "Avoid staining foods and drinks (coffee, tea, wine) for 48 hours",
        "Use desensitizing toothpaste if you experience sensitivity",
        "Follow the specific whitening maintenance guide provided",
        "Use a soft-bristled toothbrush"
      ]
    },
    {
      title: "General Guidelines",
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
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Patient Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
              {beforeTravelChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className="checklist-item"
                  onClick={() => toggleChecklist(item.id)}
                >
                  <div className={`checkbox-custom ${checklist[item.id] ? 'checked' : ''}`}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className={`checklist-label ${checklist[item.id] ? 'checked' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="checklist-box">
              <h3>Day Before Treatment</h3>
              {dayBeforeChecklist.map((item) => (
                <div 
                  key={item.id} 
                  className="checklist-item"
                  onClick={() => toggleChecklist(item.id)}
                >
                  <div className={`checkbox-custom ${checklist[item.id] ? 'checked' : ''}`}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className={`checklist-label ${checklist[item.id] ? 'checked' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="care-guide" className="section bg-white">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Post-Treatment Care Guide</h2>
            <p>Follow these guidelines to ensure optimal healing and long-lasting results.</p>
          </div>

          <div className="care-guide-grid">
            {careGuides.map((guide, index) => (
              <div key={index} className="care-card">
                <div 
                  className="care-header"
                  onClick={() => setOpenCare(openCare === index ? null : index)}
                >
                  <h3>{guide.title}</h3>
                  {openCare === index ? <ChevronUp size={20} color="#451271" /> : <ChevronDown size={20} color="#451271" />}
                </div>
                <div className={`care-content ${openCare === index ? 'open' : ''}`}>
                  {guide.content.map((point, i) => (
                    <p key={i}>{point}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientResourcesPage;
