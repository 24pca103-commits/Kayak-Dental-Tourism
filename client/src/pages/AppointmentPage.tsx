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
import {
  COUNTRY_PHONE_LIST,
  getCountryConfig,
  validatePhoneNumber,
  validateEmail,
  validateFullName,
  validateDentalConcern,
  validateFiles,
} from '../utils/phoneValidation';
import '../styles/AppointmentPage.css';

const AppointmentPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    issue: '',
  });
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countryConfig = getCountryConfig(selectedCountry);

  const validateAll = () => {
    const errs: Record<string, string> = {};

    const nameRes = validateFullName(form.name);
    if (!nameRes.isValid && nameRes.error) errs.name = nameRes.error;

    const phoneRes = validatePhoneNumber(form.phone, selectedCountry);
    if (!phoneRes.isValid && phoneRes.error) errs.phone = phoneRes.error;

    const emailRes = validateEmail(form.email);
    if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

    const issueRes = validateDentalConcern(form.issue);
    if (!issueRes.isValid && issueRes.error) errs.issue = issueRes.error;

    const fileRes = validateFiles(files);
    if (!fileRes.isValid && fileRes.error) errs.files = fileRes.error;

    return errs;
  };

  const validateSingleField = (name: string, value: string, country = selectedCountry) => {
    switch (name) {
      case 'name':
        return validateFullName(value).error || '';
      case 'phone':
        return validatePhoneNumber(value, country).error || '';
      case 'email':
        return validateEmail(value).error || '';
      case 'issue':
        return validateDentalConcern(value).error || '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Instant validation if already touched or has error
    if (touched[name] || errors[name]) {
      const err = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateSingleField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    if (form.phone.trim()) {
      const err = validateSingleField('phone', form.phone, newCountry);
      setErrors(prev => ({ ...prev, phone: err }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...files, ...newFiles].slice(0, 5);
      const validation = validateFiles(combined);
      if (!validation.isValid && validation.error) {
        setErrors(prev => ({ ...prev, files: validation.error || '' }));
      } else {
        setErrors(prev => ({ ...prev, files: '' }));
      }
      setFiles(combined);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    const validation = validateFiles(updated);
    setErrors(prev => ({ ...prev, files: validation.error || '' }));
  };

  const readFileAsCompressedDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve((event.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((event.target?.result as string) || '');
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, issue: true });
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const phoneResult = validatePhoneNumber(form.phone, selectedCountry);
    const fullPhone = phoneResult.formatted || `${countryConfig.code} ${form.phone.trim()}`;

    try {
      // Process attached photos & files into Data URLs for permanent, bulletproof storage
      const uploadedAttachments: Array<{ name: string; url: string; size?: number; type?: string }> = [];

      if (files.length > 0) {
        for (const f of files) {
          try {
            const dataUrl = await readFileAsCompressedDataURL(f);
            if (dataUrl) {
              uploadedAttachments.push({
                name: f.name,
                url: dataUrl,
                size: f.size,
                type: f.type || 'image/jpeg',
              });
            }
          } catch (readErr) {
            console.warn('File read error:', readErr);
          }
        }
      }

      const attachmentsJson = uploadedAttachments.length > 0 ? JSON.stringify(uploadedAttachments) : undefined;

      // 1. Save directly to backend API (MySQL database)
      try {
        await appointmentsAPI.create({
          patientName: form.name.trim(),
          phone: fullPhone,
          email: form.email.trim().toLowerCase(),
          serviceName: 'Free Online Consultation',
          doctorName: 'Any Available Doctor',
          appointmentDate: new Date().toISOString(),
          appointmentTime: 'Online Consultation',
          message: form.issue.trim(),
          attachments: attachmentsJson,
          status: 'pending',
        });
      } catch (apiErr) {
        console.warn('API create warning (will use local fallback):', apiErr);
      }

      // 2. Also cache to local storage
      const newBooking = {
        _id: 'bk_' + Date.now(),
        patientName: form.name,
        phone: fullPhone,
        email: form.email,
        serviceName: 'Free Online Consultation',
        appointmentDate: new Date().toISOString(),
        appointmentTime: 'Online Consultation',
        message: form.issue,
        attachments: attachmentsJson,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      try {
        const stored = JSON.parse(localStorage.getItem('kayal_local_appointments') || '[]');
        localStorage.setItem('kayal_local_appointments', JSON.stringify([newBooking, ...stored]));
      } catch {}

      // 3. Broadcast instant sync to all open admin tabs/windows
      try {
        const bc = new BroadcastChannel('kayal_live_sync');
        bc.postMessage({ type: 'NEW_APPOINTMENT', patientName: form.name, timestamp: Date.now() });
        bc.close();
      } catch {}

      // 4. Send real-time confirmation email to user in background (non-blocking)
      sendRealtimeEmail({
        name: form.name,
        email: form.email,
        phone: fullPhone,
        subject: 'Free Online Consultation Request',
        message: form.issue,
      }).catch((emailErr) => console.warn('Email notification error:', emailErr));

      setSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
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
                  <form onSubmit={handleSubmit} className="consultation-form" noValidate>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        type="text"
                        name="name"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={60}
                        required
                      />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label"><Phone size={14} /> Phone / WhatsApp *</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <select
                          value={selectedCountry}
                          onChange={handleCountryChange}
                          className="form-input"
                          style={{ width: '150px', flexShrink: 0, padding: '0 8px', fontSize: '0.85rem', cursor: 'pointer', background: 'white' }}
                          aria-label="Country Code"
                        >
                          {COUNTRY_PHONE_LIST.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.flag} {c.code} ({c.country})
                            </option>
                          ))}
                        </select>
                        <input
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          type="tel"
                          name="phone"
                          placeholder={countryConfig.placeholder}
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          style={{ flex: 1, minWidth: 0 }}
                        />
                      </div>
                      <span className="form-hint" style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '0.3rem', display: 'block' }}>
                        {countryConfig.flag} Expected format for {countryConfig.country}: {countryConfig.hint}
                      </span>
                      {errors.phone && <span className="form-error" style={{ marginTop: '0.2rem', display: 'block' }}>{errors.phone}</span>}
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
                        onBlur={handleBlur}
                        required
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Describe Your Dental Issue *</label>
                        <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0, color: form.issue.trim().split(/\s+/).filter(Boolean).length > 500 ? '#ef4444' : 'var(--gray-500)' }}>
                          {form.issue.trim() ? form.issue.trim().split(/\s+/).filter(Boolean).length : 0}/500 words
                        </span>
                      </div>
                      <textarea
                        className={`form-input ${errors.issue ? 'error' : ''}`}
                        name="issue"
                        rows={5}
                        placeholder="Tell us about your dental concern, what treatments you're interested in, any relevant medical history, and your preferred timeline..."
                        value={form.issue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={3000}
                        required
                        style={{ marginTop: '0.35rem' }}
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
                      {errors.files && <span className="form-error" style={{ display: 'block', marginTop: '0.4rem' }}>{errors.files}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                      {loading ? 'Submitting...' : <><Send size={18} /> Submit Consultation Request</>}
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
