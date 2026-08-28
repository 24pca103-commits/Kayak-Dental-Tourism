import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { faqsAPI } from '../services/api';
import type { FAQ } from '../types';

const DEMO: FAQ[] = [
  { _id: '1', question: 'How often should I visit the dentist?', answer: 'We recommend a dental check-up every 6 months to maintain healthy teeth and gums. Regular visits help detect problems early and prevent costly treatments.', displayOrder: 1, status: 'active', createdAt: '' },
  { _id: '2', question: 'Do dental treatments cause pain?', answer: 'Most treatments are performed using modern techniques and appropriate anesthesia to ensure patient comfort. At KAYAL, we prioritize pain-free dentistry in a calm, reassuring environment.', displayOrder: 2, status: 'active', createdAt: '' },
  { _id: '3', question: 'Do you offer braces and clear aligners?', answer: 'Yes. We provide comprehensive orthodontic solutions including traditional metal braces, ceramic braces, and clear aligners based on individual patient requirements.', displayOrder: 3, status: 'active', createdAt: '' },
  { _id: '4', question: 'How long does a dental implant procedure take?', answer: 'The full dental implant process typically takes 3–6 months including the implant placement, healing period, and crown fitting. The dentist will provide a personalized timeline after examination.', displayOrder: 4, status: 'active', createdAt: '' },
  { _id: '5', question: 'Is teeth whitening safe?', answer: 'Professional teeth whitening performed under dental supervision is safe and effective for most patients. Our dental team assesses your suitability before treatment and uses only medical-grade whitening products.', displayOrder: 5, status: 'active', createdAt: '' },
  { _id: '6', question: 'Do you provide emergency dental care?', answer: 'Yes. We provide emergency dental care for urgent dental problems such as severe toothache, broken teeth, or dental trauma. Contact our clinic immediately and we will prioritize your appointment.', displayOrder: 6, status: 'active', createdAt: '' },
  { _id: '7', question: 'What age should my child first visit the dentist?', answer: "We recommend bringing your child for their first dental visit when their first tooth appears, or by their first birthday. Early visits help establish healthy habits and prevent future problems.", displayOrder: 7, status: 'active', createdAt: '' },
  { _id: '8', question: 'How do I take care of dental implants?', answer: 'Dental implants require the same care as natural teeth — brushing twice daily, flossing, and regular dental check-ups. With proper care, implants can last a lifetime.', displayOrder: 8, status: 'active', createdAt: '' },
  { _id: '9', question: 'How much does teeth whitening cost?', answer: 'Whitening costs vary based on the treatment type (in-office or take-home). We offer competitive pricing and will provide a detailed estimate during your consultation.', displayOrder: 9, status: 'active', createdAt: '' },
  { _id: '10', question: 'Do you accept dental insurance?', answer: 'We work with various insurance providers. Please contact our team to verify your specific coverage before your appointment.', displayOrder: 10, status: 'active', createdAt: '' },
];

const FAQsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'FAQs | KAYAL Dental Care';
    faqsAPI.getAll().then(r => setFaqs(r.data?.data || [])).catch(() => setFaqs(DEMO));
  }, []);

  const list = (faqs.length > 0 ? faqs : DEMO).filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '70px' }}>
      <section style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-white" style={{ marginBottom: '1rem' }}>FAQs</div>
          <h1 className="section-title text-white">Frequently Asked Questions</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem' }}>Everything you need to know about dental care at KAYAL</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.75rem 1.25rem', border: '1.5px solid var(--gray-200)', borderRadius: '50px', fontSize: '0.9rem', width: '100%', maxWidth: 400, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {list.map((faq, idx) => (
              <div key={faq._id} style={{ border: `1.5px solid ${openId === faq._id ? 'var(--purple-300)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: openId === faq._id ? 'var(--purple-50)' : 'white', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: openId === faq._id ? 'var(--purple-700)' : 'var(--gray-800)', textAlign: 'left', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: openId === faq._id ? 'var(--purple-600)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: openId === faq._id ? 'white' : 'var(--gray-500)', flexShrink: 0 }}>{idx + 1}</span>
                    {faq.question}
                  </div>
                  {openId === faq._id ? <ChevronUp size={16} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} style={{ flexShrink: 0 }} />}
                </button>
                {openId === faq._id && (
                  <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.75 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            {list.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>No questions found matching "{search}"</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQsPage;
