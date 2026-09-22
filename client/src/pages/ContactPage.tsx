import React, { useState, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Video, X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { appointmentsAPI, feedbackAPI } from '../services/api';
import { sendRealtimeEmail } from '../services/emailService';
import { saveVideoBlob } from '../utils/videoStorage';
import {
  COUNTRY_PHONE_LIST,
  getCountryConfig,
  validatePhoneNumber,
  validateEmail,
  validateFullName,
} from '../utils/phoneValidation';
import '../styles/ContactPage.css';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Video upload & progress states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoPlaybackError, setVideoPlaybackError] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const videoUploadPromiseRef = useRef<Promise<string | null> | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const countryConfig = getCountryConfig(selectedCountry);
  const maxPhoneDigits = Math.max(...(countryConfig.digitLengths || [10]));

  const generateVideoThumbnail = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(0.2, (video.duration || 1) / 2);
        } catch {
          // fallback
        }
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 270;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.8);
            cleanup();
            resolve(thumb);
            return;
          }
        } catch {
          // fallback
        }
        cleanup();
        resolve(null);
      };

      video.onerror = () => {
        cleanup();
        resolve(null);
      };

      setTimeout(() => {
        cleanup();
        resolve(null);
      }, 2500);
    });
  };

  const validateAll = () => {
    const e: Record<string, string> = {};
    const nameRes = validateFullName(form.name);
    if (!nameRes.isValid && nameRes.error) e.name = nameRes.error;

    const phoneRes = validatePhoneNumber(form.phone, selectedCountry);
    if (!phoneRes.isValid && phoneRes.error) e.phone = phoneRes.error;

    const emailRes = validateEmail(form.email);
    if (!emailRes.isValid && emailRes.error) e.email = emailRes.error;

    if (!form.message.trim()) e.message = 'Message is required (at least 5 characters).';
    else if (form.message.trim().length < 5) e.message = 'Please provide more details in your message.';

    return e;
  };

  const isFormValid = Boolean(
    form.name.trim().length >= 2 &&
    validateFullName(form.name).isValid &&
    form.phone.trim().length >= 7 &&
    validatePhoneNumber(form.phone, selectedCountry).isValid &&
    form.email.trim().length > 0 &&
    validateEmail(form.email).isValid &&
    form.message.trim().length >= 5
  );

  const validateSingleField = (name: string, value: string, country = selectedCountry) => {
    switch (name) {
      case 'name':
        return validateFullName(value).error || '';
      case 'phone':
        return validatePhoneNumber(value, country).error || '';
      case 'email':
        return validateEmail(value).error || '';
      case 'message':
        if (!value.trim()) return 'Message is required.';
        if (value.trim().length < 5) return 'Please provide more details in your message.';
        return '';
      default:
        return '';
    }
  };

  const startVideoPreUpload = (file: File): Promise<string | null> => {
    setIsUploadingVideo(true);
    setUploadProgress(5);
    setUploadStatus('Uploading video...');

    const p = (async () => {
      try {
        const fd = new FormData();
        fd.append('files', file);

        // Upload with timeout race (25s max)
        const uploadCall = appointmentsAPI.uploadAttachments(fd, (percent) => {
          setUploadProgress(percent);
          if (percent < 100) {
            setUploadStatus(`Uploading video (${percent}%)...`);
          } else {
            setUploadStatus('Processing video...');
          }
        });

        const timeoutCall = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout fallback')), 25000)
        );

        const uploadRes: any = await Promise.race([uploadCall, timeoutCall]);
        if (uploadRes.data?.files?.[0]?.url) {
          const url = uploadRes.data.files[0].url;
          setUploadedVideoUrl(url);
          setUploadProgress(100);
          setUploadStatus('Video ready!');
          return url;
        }
      } catch (err) {
        console.warn('Background video upload note (local IndexedDB backup active):', err);
        setUploadProgress(100);
        setUploadStatus('Video ready!');
      } finally {
        setIsUploadingVideo(false);
      }
      return null;
    })();

    videoUploadPromiseRef.current = p;
    return p;
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    setVideoPlaybackError(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that the file is a video format
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi|3gp|flv|wmv|ogv|ts)$/i.test(file.name);
    if (!isVideo) {
      setVideoError('Please select a valid video file (MP4, WebM, MOV, MKV, AVI, etc.).');
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setVideoError('Video file size exceeds 100MB limit. Please choose a smaller video.');
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(file);
    const objUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objUrl);
    setUploadedVideoUrl(null);

    // Immediately start pre-upload in background while user fills the form!
    startVideoPreUpload(file);

    // Try to auto-generate thumbnail poster
    try {
      const thumb = await generateVideoThumbnail(file);
      if (thumb) {
        setVideoThumbnail(thumb);
      }
    } catch {
      // ignore
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoThumbnail(null);
    setVideoPlaybackError(false);
    setVideoError(null);
    setUploadedVideoUrl(null);
    setIsUploadingVideo(false);
    setUploadProgress(0);
    setUploadStatus('');
    videoUploadPromiseRef.current = null;
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, message: true });
    const errs = validateAll();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const phoneResult = validatePhoneNumber(form.phone, selectedCountry);
    const fullPhone = phoneResult.formatted || `${countryConfig.code} ${form.phone.trim()}`;

    try {
      // 1. If video attached, save it in IndexedDB and reuse pre-uploaded URL
      let videoKey: string | undefined = undefined;
      let finalUploadedVideoUrl: string | undefined = uploadedVideoUrl || undefined;

      if (videoFile) {
        videoKey = 'vid_' + Date.now();
        await saveVideoBlob(videoKey, videoFile);

        // If background upload is still in progress, wait for it with timeout
        if (!finalUploadedVideoUrl && videoUploadPromiseRef.current) {
          try {
            setUploadStatus('Finalizing video...');
            const resUrl = await videoUploadPromiseRef.current;
            if (resUrl) finalUploadedVideoUrl = resUrl;
          } catch {
            // fallback
          }
        } else if (!finalUploadedVideoUrl) {
          try {
            const resUrl = await startVideoPreUpload(videoFile);
            if (resUrl) finalUploadedVideoUrl = resUrl;
          } catch {
            // fallback
          }
        }
      }


      // 3. Cache feedback message to local storage for Admin Feedback Page
      const newFeedback = {
        _id: 'fb_' + Date.now(),
        name: form.name,
        phone: fullPhone,
        email: form.email,
        subject: form.subject || 'General Inquiry',
        message: form.message,
        rating: rating > 0 ? rating : 5,
        status: 'unread',
        createdAt: new Date().toISOString(),
        hasVideo: !!videoFile,
        videoKey: videoKey,
        videoUrl: finalUploadedVideoUrl || uploadedVideoUrl || undefined,
        videoName: videoFile?.name,
        videoSize: videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) + ' MB' : undefined,
        isPublishedToTestimonials: false,
      };
      // 3. Send feedback to central backend API (instant auto-update across ports 5173 & 5174)
      try {
        await feedbackAPI.create(newFeedback);
      } catch (apiErr) {
        console.warn('Backend feedback sync notice (local backup active):', apiErr);
      }

      // 4. Cache feedback message to local storage for Admin Feedback Page
      try {
        const storedFeedbacks = JSON.parse(localStorage.getItem('kayal_feedbacks') || '[]');
        localStorage.setItem('kayal_feedbacks', JSON.stringify([newFeedback, ...storedFeedbacks]));
      } catch { }

      // 5. Broadcast instant sync to all open admin tabs/windows
      try {
        const bc = new BroadcastChannel('kayal_live_sync');
        bc.postMessage({ type: 'NEW_FEEDBACK', name: form.name, timestamp: Date.now() });
        bc.close();
      } catch { }

      // 5. Send real-time confirmation email to user in background (non-blocking)
      sendRealtimeEmail({
        name: form.name,
        email: form.email,
        phone: fullPhone,
        subject: form.subject || 'General Inquiry',
        message: form.message,
      }).catch((emailErr) => console.warn('Email notification error:', emailErr));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Strict digit restriction for phone field
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, maxPhoneDigits);
      setForm(p => ({ ...p, phone: digitsOnly }));
      if (touched.phone || errors.phone) {
        const err = validateSingleField('phone', digitsOnly, selectedCountry);
        setErrors(p => ({ ...p, phone: err }));
      }
      return;
    }

    setForm(p => ({ ...p, [name]: value }));
    if (touched[name] || errors[name]) {
      const err = validateSingleField(name, value);
      setErrors(p => ({ ...p, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    const err = validateSingleField(name, value);
    setErrors(p => ({ ...p, [name]: err }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const newConfig = getCountryConfig(newCountry);
    const newMaxDigits = Math.max(...(newConfig.digitLengths || [10]));
    const truncatedPhone = form.phone.slice(0, newMaxDigits);
    setForm(p => ({ ...p, phone: truncatedPhone }));
    if (truncatedPhone.trim()) {
      const err = validateSingleField('phone', truncatedPhone, newCountry);
      setErrors(p => ({ ...p, phone: err }));
    }
  };

  return (
    <div className="contact-page">
      {/* Header / Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'left' }}>
          <div className="badge badge-white" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Contact Us</div>
          <h1 className="section-title text-white" style={{ textAlign: 'left', margin: '0 0 0.75rem 0' }}>Get In Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', textAlign: 'left', maxWidth: '620px', fontSize: '1.1rem', lineHeight: 1.6 }}>We'd love to hear from you. Reach out and our dental team will respond promptly.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div id="details" className="contact-info-col" style={{ scrollMarginTop: '110px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--purple-700)', marginBottom: '1.5rem' }}>Clinic Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: <MapPin size={20} />, title: 'Address', info: '123 Seaside Road, Coimbatore, Tamil Nadu - 641001' },
                  { icon: <Phone size={20} />, title: 'Phone', info: '+91 78679 26159', href: 'tel:+917867926159' },
                  { icon: <Mail size={20} />, title: 'Email', info: 'hello@kayaldental.com', href: 'mailto:hello@kayaldental.com' },
                  { icon: <Clock size={20} />, title: 'Working Hours', info: 'All Days Available: 9:00 AM – 7:00 PM\n(Monday – Sunday)' },
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
              <div id="map" className="contact-map-card" style={{ scrollMarginTop: '110px' }}>
                <iframe
                  title="Kayal Dental Clinic Location"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=123%20Seaside%20Road,%20Coimbatore,%20Tamil%20Nadu&t=&z=14&ie=UTF8&iwloc=&output=embed"
                />
                <div className="contact-map-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                    <MapPin size={16} color="#451271" style={{ color: '#451271', flexShrink: 0 }} />
                    <span>123 Seaside Road, Coimbatore</span>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=123+Seaside+Road,+Coimbatore,+Tamil+Nadu+-+600001"
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
            <div id="enquiry" className="contact-form-card" style={{ scrollMarginTop: '110px' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--cyan-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--cyan-500)' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--purple-700)' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>We'll get back to you within 24 hours.</p>
                  <button className="btn btn-purple" style={{ marginTop: '1.5rem' }} onClick={() => { setSent(false); setRating(0); handleRemoveVideo(); }}>Send Another</button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '1.5rem' }}>Send Us a Message</h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }} noValidate>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          name="name"
                          placeholder="Your full name"
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
                        <div className="contact-phone-group">
                          <select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="form-input contact-phone-select"
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
                            name="phone"
                            type="tel"
                            placeholder={countryConfig.placeholder}
                            value={form.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={maxPhoneDigits}
                            required
                            style={{ flex: 1, minWidth: 0 }}
                          />
                        </div>
                        {errors.phone && <span className="form-error" style={{ marginTop: '0.2rem', display: 'block' }}>{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label"><Mail size={14} /> Email *</label>
                      <input
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" name="subject" placeholder="How can we help?" value={form.subject} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea
                        className={`form-input ${errors.message ? 'error' : ''}`}
                        name="message"
                        rows={4}
                        placeholder="Tell us more..."
                        value={form.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={3000}
                        required
                      />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>

                    {/* Interactive Star Rating Selector */}
                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: '0.4rem' }}>
                        Rate Your Experience *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 2px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                transition: 'transform 0.15s ease',
                                transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                              }}
                              aria-label={`${star} star rating`}
                            >
                              <Star
                                size={26}
                                fill={(hoverRating || rating) >= star ? '#f59e0b' : '#e2e8f0'}
                                color={(hoverRating || rating) >= star ? '#d97706' : '#cbd5e1'}
                              />
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: (hoverRating || rating) === 0 ? 'var(--gray-500)' : 'var(--purple-700)' }}>
                          {(hoverRating || rating) === 0 && <span style={{ fontWeight: 500 }}>(Tap to rate)</span>}
                          {(hoverRating || rating) === 5 && '5/5 (Excellent)'}
                          {(hoverRating || rating) === 4 && '4/5 (Very Good)'}
                          {(hoverRating || rating) === 3 && '3/5 (Good)'}
                          {(hoverRating || rating) === 2 && '2/5 (Fair)'}
                          {(hoverRating || rating) === 1 && '1/5 (Poor)'}
                        </span>
                      </div>
                    </div>

                    {/* Patient Feedback Video Upload Field */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Video size={15} color="#451271" />
                          <span>Feedback / Experience Video <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 'normal' }}>(Optional)</span></span>
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#0ea5e9', fontWeight: 600 }}>All Formats (MP4, MOV, WebM, MKV, AVI etc. Max 100MB)</span>
                      </label>

                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*, .mp4, .webm, .mov, .m4v, .mkv, .avi, .3gp, .flv, .wmv, .ogv, .ts"
                        style={{ display: 'none' }}
                        onChange={handleVideoChange}
                      />

                      {!videoPreviewUrl ? (
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '1.25rem 1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: '#f8fafc',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#24E0E1';
                            e.currentTarget.style.background = '#f0fdfa';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#451271' }}>
                            <Video size={20} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#451271', fontSize: '0.9rem' }}>Click to upload feedback video</span>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                              Share your smile review or experience video with our doctors
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          border: '1.5px solid #24E0E1',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          background: '#f0fdfa',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: '#451271' }}>
                              <Video size={16} color="#24E0E1" />
                              <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {videoFile?.name}
                              </span>
                              {videoFile && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 'normal' }}>
                                  ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveVideo}
                              style={{
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <X size={14} /> Remove Video
                            </button>
                          </div>

                          <div style={{ borderRadius: '8px', overflow: 'hidden', minHeight: '160px', maxHeight: '240px', background: '#0a0515', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!videoPlaybackError ? (
                              <video
                                key={videoPreviewUrl}
                                src={videoPreviewUrl}
                                poster={videoThumbnail || undefined}
                                controls
                                preload="auto"
                                muted
                                playsInline
                                onLoadedData={(e) => {
                                  try {
                                    if (e.currentTarget.duration && e.currentTarget.currentTime === 0) {
                                      e.currentTarget.currentTime = Math.min(0.2, e.currentTarget.duration / 2);
                                    }
                                  } catch {}
                                }}
                                onLoadedMetadata={(e) => {
                                  try {
                                    if (e.currentTarget.duration && e.currentTarget.currentTime === 0) {
                                      e.currentTarget.currentTime = Math.min(0.2, e.currentTarget.duration / 2);
                                    }
                                  } catch {}
                                }}
                                onError={() => setVideoPlaybackError(true)}
                                style={{ width: '100%', maxHeight: '240px', display: 'block', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                padding: '2rem 1rem',
                                background: 'linear-gradient(135deg, #1c0533 0%, #2e0854 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.6rem',
                                color: '#fff',
                                textAlign: 'center'
                              }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(36, 224, 225, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#24E0E1' }}>
                                  <Video size={24} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{videoFile?.name}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Video file ready • Will be processed &amp; attached to message
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Live Video Upload Progress Indicator */}
                          {videoFile && (
                            <div style={{
                              marginTop: '0.75rem',
                              background: '#ffffff',
                              border: uploadProgress >= 100 ? '1.5px solid #10b981' : '1.5px solid #24E0E1',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem',
                              boxShadow: uploadProgress >= 100 ? '0 4px 14px rgba(16, 185, 129, 0.15)' : '0 4px 14px rgba(36, 224, 225, 0.2)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: uploadProgress >= 100 ? '#059669' : '#451271' }}>
                                  {uploadProgress >= 100 ? (
                                    <CheckCircle2 size={16} color="#10b981" />
                                  ) : (
                                    <Loader2 size={16} color="#0284c7" style={{ animation: 'spin 1s linear infinite' }} />
                                  )}
                                  <span>{uploadStatus || (uploadProgress >= 100 ? 'Video ready & attached!' : isUploadingVideo ? 'Uploading video in background...' : 'Preparing video...')}</span>
                                </span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: uploadProgress >= 100 ? '#10b981' : '#0284c7' }}>
                                  {uploadProgress}%
                                </span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#e2e8f0',
                                borderRadius: '999px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${uploadProgress}%`,
                                  background: uploadProgress >= 100
                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : 'linear-gradient(90deg, #24E0E1, #451271)',
                                  borderRadius: '999px',
                                  transition: 'width 0.3s ease-out'
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {videoError && <span className="form-error" style={{ marginTop: '0.35rem', display: 'block' }}>{videoError}</span>}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-purple btn-lg"
                      disabled={!isFormValid || loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: (!isFormValid && !loading) ? 0.65 : 1,
                        cursor: (!isFormValid && !loading) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>{videoFile ? `Uploading Video (${uploadProgress}%)...` : 'Sending Message...'}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    {!isFormValid && !loading && (
                      <p style={{ margin: '0.45rem 0 0', fontSize: '0.78rem', color: '#9333ea', textAlign: 'center', fontWeight: 500 }}>
                        * Please fill all required fields (Name, Phone, Email, Message) to enable the Send button.
                      </p>
                    )}
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
