import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { appointmentsAPI } from '../services/api';
import { sendRealtimeEmail } from '../services/emailService';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      // 1. Send real-time confirmation email to user
      await sendRealtimeEmail({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject || 'General Inquiry',
        message: form.message,
      });

      // 2. Also save to appointments API if available
      try {
        await appointmentsAPI.create({
          patientName: form.name,
          phone: form.phone,
          email: form.email,
          serviceName: form.subject || 'General Inquiry',
          appointmentDate: new Date().toISOString(),
          appointmentTime: '10:00 AM',
          message: form.message,
        });
      } catch {
        // silent
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <section style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-white" style={{ marginBottom: '1rem' }}>Contact Us</div>
          <h1 className="section-title text-white">Get In Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem' }}>We'd love to hear from you. Reach out and our team will respond promptly.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1.5rem' }}>Clinic Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: <MapPin size={20} />, title: 'Address', info: '123 Seaside Road, Chennai, Tamil Nadu - 600001' },
                  { icon: <Phone size={20} />, title: 'Phone', info: '+91 98765 43210', href: 'tel:+919876543210' },
                  { icon: <Mail size={20} />, title: 'Email', info: 'hello@kayaldental.com', href: 'mailto:hello@kayaldental.com' },
                  { icon: <Clock size={20} />, title: 'Working Hours', info: 'Monday – Saturday: 9:00 AM – 7:00 PM\nSunday: Closed (Emergency available)' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--purple-50)', border: '1.5px solid var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.2rem' }}>{item.title}</p>
                      {item.href ? (
                        <a href={item.href} style={{ fontSize: '0.9rem', color: 'var(--gray-800)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--purple-600)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-800)')}>{item.info}</a>
                      ) : (
                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{item.info}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Interactive Google Map */}
              <div id="map" style={{ marginTop: '2rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--gray-200)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                <iframe
                  title="Kayal Dental Clinic Location"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=123%20Seaside%20Road,%20Chennai,%20Tamil%20Nadu&t=&z=14&ie=UTF8&iwloc=&output=embed"
                />
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                    <MapPin size={16} color="#451271" style={{ color: '#451271', flexShrink: 0 }} />
                    <span>123 Seaside Road, Chennai</span>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=123+Seaside+Road,+Chennai,+Tamil+Nadu+-+600001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-purple btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--cyan-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--cyan-500)' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--purple-700)' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>We'll get back to you within 24 hours.</p>
                  <button className="btn btn-purple" style={{ marginTop: '1.5rem' }} onClick={() => setSent(false)}>Send Another</button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1.5rem' }}>Send Us a Message</h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className={`form-input ${errors.name ? 'error' : ''}`} name="name" placeholder="Your full name" value={form.name} onChange={handleChange} />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input className={`form-input ${errors.phone ? 'error' : ''}`} name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className={`form-input ${errors.email ? 'error' : ''}`} name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" name="subject" placeholder="How can we help?" value={form.subject} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className={`form-input ${errors.message ? 'error' : ''}`} name="message" rows={4} placeholder="Tell us more..." value={form.message} onChange={handleChange} />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>
                    <button type="submit" className="btn btn-purple btn-lg" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Send size={16} />{loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
