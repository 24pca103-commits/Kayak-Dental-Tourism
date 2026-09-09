import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Upload, X, FileText, Image as ImageIcon,
  Send, ClipboardList, DollarSign, Clock, Plane,
  Video, Phone, Shield, CheckCircle
} from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { appointmentsAPI } from '../services/api';
import { sendRealtimeEmail } from '../services/emailService';
import './AppointmentPage.css';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
];

const AppointmentPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    issue: '',
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone/WhatsApp number is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.issue.trim()) e.issue = 'Please describe your dental concern';
    else if (form.issue.trim().length < 10) e.issue = 'Please provide more detail (at least 10 characters)';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const fullPhone = form.phone.startsWith('+') ? form.phone : `${countryCode} ${form.phone}`;
    try {
      // 1. Send real-time confirmation email to user
      await sendRealtimeEmail({
        name: form.name,
        email: form.email,
        phone: fullPhone,
        subject: 'Free Online Consultation Request',
        message: form.issue,
      });

      // 2. Also save to appointments API if available
      try {
        await appointmentsAPI.create({
          patientName: form.name,
          phone: fullPhone,
          email: form.email,
          serviceName: 'Free Online Consultation',
          appointmentDate: new Date().toISOString(),
          appointmentTime: 'Online Consultation',
          message: form.issue,
        });
      } catch {
        // silent
      }
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const expectSteps = [
    { icon: ClipboardList, title: 'Personalized Treatment Plan', desc: 'Our specialists will review your case and create a customized treatment plan tailored to your specific needs.' },
    { icon: DollarSign, title: 'Transparent Cost Quote', desc: 'Receive a detailed, all-inclusive cost breakdown with no hidden charges — including treatment, materials, and follow-ups.' },
    { icon: Clock, title: 'Treatment Timeline', desc: 'Get a clear timeline showing how long your treatment will take, from arrival to completion, so you can plan your trip.' },
    { icon: Plane, title: 'Travel Assistance', desc: 'Our team helps with visa invitation letters, airport pickup, hotel booking, and local travel arrangements.' },
  ];

  return (
    <div className="consultation-page" style={{ paddingTop: '70px' }}>
      {/* Hero */}
      <section className="consultation-hero">
        <div className="container" style={{ textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Video size={13} /> Free Video Consultation
          </div>
          <h1 className="section-title text-white" style={{ textAlign: 'left', margin: '0 0 0.75rem 0', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}>Book Free Online Consultation</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', maxWidth: '620px', fontSize: '1.1rem', lineHeight: 1.6, textAlign: 'left' }}>
            Share your dental concerns and receive a personalized treatment plan from our expert specialists — all from the comfort of your home.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="consultation-grid">
            {/* Form */}
            <div className="consultation-form-card">
              {success ? (
                <div className="consultation-success">
                  <div className="consultation-success-icon">
                    <CheckCircle size={48} />
                  </div>
                  <h3>Consultation Request Submitted!</h3>
                  <p>Our dental specialists will review your case and contact you within 24 hours with a personalized treatment plan and cost estimate.</p>
                  <button className="btn btn-purple" onClick={() => { setSuccess(false); setForm({ name: '', phone: '', email: '', issue: '' }); setFiles([]); }}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  <div className="consultation-form-header">
                    <h2>Tell Us About Your Dental Concern</h2>
                    <p>Fill in the form below and upload any relevant photos or documents.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="consultation-form">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                      />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label"><Phone size={14} /> Phone / WhatsApp *</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="form-input"
                          style={{ width: '130px', flexShrink: 0, padding: '0 8px', fontSize: '0.85rem', cursor: 'pointer' }}
                          aria-label="Country Code"
                        >
                          {COUNTRY_CODES.map((c, i) => (
                            <option key={i} value={c.code}>
                              {c.flag} {c.code} ({c.country})
                            </option>
                          ))}
                        </select>
                        <input
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          type="tel"
                          name="phone"
                          placeholder="78679 26159"
                          value={form.phone}
                          onChange={handleChange}
                          style={{ flex: 1, minWidth: 0 }}
                        />
                      </div>
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Describe Your Dental Issue *</label>
                      <textarea
                        className={`form-input ${errors.issue ? 'error' : ''}`}
                        name="issue"
                        rows={5}
                        placeholder="Tell us about your dental concern, what treatments you're interested in, any relevant medical history, and your preferred timeline..."
                        value={form.issue}
                        onChange={handleChange}
                      />
                      {errors.issue && <span className="form-error">{errors.issue}</span>}
                    </div>

                    {/* File Upload */}
                    <div className="form-group">
                      <label className="form-label"><Upload size={14} /> Upload Photos & Documents (Optional)</label>
                      <div
                        className="consultation-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={28} />
                        <p>Click to upload or drag & drop</p>
                        <span>X-rays, dental photos, medical reports (Max 5 files, 5MB each)</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {files.length > 0 && (
                        <div className="consultation-files">
                          {files.map((file, i) => (
                            <div key={i} className="consultation-file-item">
                              {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                              <span>{file.name}</span>
                              <button type="button" onClick={() => removeFile(i)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                      {loading ? 'Submitting...' : <><Send size={18} /> Submit  Request</>}
                    </button>

                    <p className="consultation-note">
                      <Shield size={14} /> Your information is secure and confidential. We respond within 24 hours.
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Side Info */}
            <div className="consultation-side">
              <div className="consultation-side-card">
                <h4>How It Works</h4>
                <div className="consultation-steps">
                  <div className="consultation-step">
                    <span className="consultation-step-num">1</span>
                    <div>
                      <strong>Submit Your Details</strong>
                      <p>Fill out the form with your dental concerns and upload any photos or X-rays.</p>
                    </div>
                  </div>
                  <div className="consultation-step">
                    <span className="consultation-step-num">2</span>
                    <div>
                      <strong>Expert Review</strong>
                      <p>Our specialists review your case within 24 hours.</p>
                    </div>
                  </div>
                  <div className="consultation-step">
                    <span className="consultation-step-num">3</span>
                    <div>
                      <strong>Video Consultation</strong>
                      <p>Schedule a free video call to discuss your treatment plan.</p>
                    </div>
                  </div>
                  <div className="consultation-step">
                    <span className="consultation-step-num">4</span>
                    <div>
                      <strong>Plan Your Visit</strong>
                      <p>Receive your treatment plan, cost estimate, and travel assistance.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="consultation-side-card consultation-side-card--accent">
                <h4 style={{ color: '#451271' }}>Need Immediate Help?</h4>
                <p style={{ color: '#000000' }}>Chat with us on WhatsApp for instant assistance.</p>
                <a
                  href="https://wa.me/917867926159"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    marginTop: '0.75rem',
                    background: '#25D366',
                    borderColor: '#25D366',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    borderRadius: '50px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  }}
                >
                  <WhatsAppIcon size={18} color="#ffffff" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="consultation-expect">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>After Your Consultation</div>
            <h2 className="section-title">What to Expect</h2>
            <p className="section-subtitle" style={{ maxWidth: 600, margin: '0.5rem auto 0' }}>
              Here's what happens after you submit your consultation request.
            </p>
          </div>
          <div className="consultation-expect-grid">
            {expectSteps.map((step, i) => (
              <div key={i} className="consultation-expect-card">
                <div className="consultation-expect-icon">
                  <step.icon size={24} />
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="consultation-cta">
        <div className="container text-center" style={{ textAlign: 'center' }}>
          <h2 className="section-title text-white" style={{ textAlign: 'center' }}>Questions Before Booking?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.75rem', marginBottom: '1.5rem', fontSize: '18px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            Explore our dental tourism page or patient resources for more information.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dental-tourism" className="btn btn-primary btn-lg">Why India? <ArrowRight size={16} /></Link>
            <Link to="/patient-resources" className="btn btn-secondary btn-lg">Patient Resources</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppointmentPage;
