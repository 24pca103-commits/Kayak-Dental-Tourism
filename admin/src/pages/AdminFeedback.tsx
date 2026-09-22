import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Trash2, Mail, Phone, Calendar, RefreshCw, CheckCircle,
  Search, User, Video, Play, UploadCloud, X, ShieldCheck, Star
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { testimonialsAPI, feedbackAPI } from '../services/api';
import {
  saveVideoBlob,
  getVideoBlobUrl,
  publishVideo,
  unpublishVideo,
  getPublishedVideos
} from '../utils/videoStorage';

interface FeedbackItem {
  _id: string;
  serverAppointmentId?: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  rating?: number;
  status?: string;
  createdAt: string;
  hasVideo?: boolean;
  videoKey?: string;
  videoUrl?: string;
  videoName?: string;
  videoSize?: string;
  isPublishedToTestimonials?: boolean;
}

const INITIAL_DEMO_FEEDBACKS: FeedbackItem[] = [
  {
    _id: 'fb_demo_1',
    name: 'Michael Hansen',
    phone: '+45 20 12 34 56',
    email: 'michael.hansen@example.com',
    subject: 'Dental Tourism Consultation Inquiry',
    message: 'Hello Kayal Dental team, I am planning a trip to Coimbatore from Denmark for dental implant treatment. Could you please share the procedure details and estimated duration?',
    rating: 5,
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: 'fb_demo_2',
    name: 'Marcus Tan',
    phone: '+65 9123 4567',
    email: 'marcus.tan@example.com',
    subject: 'Full Mouth Rehab & Smile Makeover',
    message: 'Hi! I would like to inquire about full mouth rehabilitation options. I will be visiting Coimbatore next month.',
    rating: 5,
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const AdminFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeVideoItem, setActiveVideoItem] = useState<FeedbackItem | null>(null);
  const [activeVideoBlobUrl, setActiveVideoBlobUrl] = useState<string | null>(null);
  const [publishedKeys, setPublishedKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const syncPublishedKeys = () => {
    const pubs = getPublishedVideos();
    const set = new Set<string>();
    pubs.forEach(p => {
      if (p.videoKey) set.add(p.videoKey);
      if (p.feedbackId) set.add(p.feedbackId);
      if (p._id) set.add(p._id);
    });
    setPublishedKeys(set);
  };

  const loadFeedbacks = async () => {
    try {
      const res = await feedbackAPI.getAll();
      const serverList = res.data?.data;
      if (Array.isArray(serverList) && serverList.length > 0) {
        setFeedbacks(prev => {
          if (
            prev.length === serverList.length &&
            prev[0]?._id === serverList[0]?._id &&
            prev[0]?.status === serverList[0]?.status &&
            prev[0]?.isPublishedToTestimonials === serverList[0]?.isPublishedToTestimonials
          ) {
            return prev;
          }
          return serverList;
        });
        syncPublishedKeys();
        return;
      }
    } catch {
      // Local storage fallback
      try {
        const raw = localStorage.getItem('kayal_feedbacks');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            setFeedbacks(list);
            syncPublishedKeys();
            return;
          }
        }
      } catch {}
    }
    setFeedbacks(INITIAL_DEMO_FEEDBACKS);
    syncPublishedKeys();
  };

  useEffect(() => {
    loadFeedbacks();

    // Auto-poll every 2.5s for real-time live sync across ports and tabs
    const pollInterval = setInterval(() => {
      loadFeedbacks();
    }, 2500);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kayal_feedbacks' || e.key === 'kayal_published_video_testimonials') {
        loadFeedbacks();
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kayal_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_FEEDBACK' || event.data?.type === 'TESTIMONIALS_UPDATED') {
          loadFeedbacks();
        }
      };
    } catch { }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const resolveVideoUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.includes('/uploads/')) {
      const idx = url.indexOf('/uploads/');
      return url.substring(idx);
    }
    return url;
  };

  useEffect(() => {
    let isMounted = true;
    if (activeVideoItem?.videoUrl) {
      setActiveVideoBlobUrl(resolveVideoUrl(activeVideoItem.videoUrl));
    } else if (activeVideoItem?.videoKey) {
      getVideoBlobUrl(activeVideoItem.videoKey).then((url) => {
        if (isMounted) {
          if (url) {
            setActiveVideoBlobUrl(url);
          } else if (activeVideoItem?.videoUrl) {
            setActiveVideoBlobUrl(resolveVideoUrl(activeVideoItem.videoUrl));
          }
        }
      });
    } else {
      setActiveVideoBlobUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeVideoItem]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient feedback message?')) {
      const itemToDelete = feedbacks.find(f => f._id === id);
      if (itemToDelete?.videoKey) {
        unpublishVideo(itemToDelete.videoKey);
      }
      unpublishVideo(id);
      const updated = feedbacks.filter(f => f._id !== id);
      setFeedbacks(updated);
      try {
        await feedbackAPI.delete(id);
      } catch {}
      try {
        localStorage.setItem('kayal_feedbacks', JSON.stringify(updated));
      } catch {}
      syncPublishedKeys();
    }
  };

  const handleMarkRead = async (id: string) => {
    const updated = feedbacks.map(f => f._id === id ? { ...f, status: 'read' } : f);
    setFeedbacks(updated);
    try {
      await feedbackAPI.update(id, { status: 'read' });
    } catch {}
    try {
      localStorage.setItem('kayal_feedbacks', JSON.stringify(updated));
    } catch {}
  };

  const handleTogglePublish = async (item: FeedbackItem) => {
    const isCurrentlyPublished = publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id);

    if (isCurrentlyPublished) {
      if (item.videoKey) unpublishVideo(item.videoKey);
      if (item.videoUrl) unpublishVideo(item.videoUrl);
      unpublishVideo(item._id);

      const updated = feedbacks.map(f => f._id === item._id ? { ...f, isPublishedToTestimonials: false } : f);
      setFeedbacks(updated);
      try {
        await feedbackAPI.update(item._id, { isPublishedToTestimonials: false });
      } catch {}
      try {
        localStorage.setItem('kayal_feedbacks', JSON.stringify(updated));
      } catch {}
      syncPublishedKeys();
      showToast(`Review from ${item.name} removed from Testimonials page.`);
    } else {
      publishVideo({
        _id: 'pub_' + item._id,
        feedbackId: item._id,
        patientName: item.name,
        location: 'Verified Patient',
        tag: item.subject || 'Patient Review',
        message: item.message,
        videoKey: item.videoKey || '',
        videoUrl: item.videoUrl || '',
        rating: item.rating || 5,
        publishedAt: new Date().toISOString()
      });

      // Also publish to backend Testimonials MySQL table if available
      try {
        const fd = new FormData();
        fd.append('patientName', item.name);
        fd.append('review', item.message || 'Excellent service');
        fd.append('rating', String(item.rating || 5));
        fd.append('status', 'active');
        if (item.videoUrl) {
          fd.append('image', item.videoUrl);
        }
        await testimonialsAPI.create(fd);
      } catch (err) {
        console.warn('Backend testimonials API notice:', err);
      }

      const updated = feedbacks.map(f => f._id === item._id ? { ...f, isPublishedToTestimonials: true } : f);
      setFeedbacks(updated);
      try {
        await feedbackAPI.update(item._id, { isPublishedToTestimonials: true });
      } catch {}
      try {
        localStorage.setItem('kayal_feedbacks', JSON.stringify(updated));
      } catch {}
      syncPublishedKeys();
      showToast(`Success! Review from ${item.name} is now LIVE on Testimonials page!`);
    }
  };

  const adminVideoInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);

  const triggerAdminVideoUpload = (item: FeedbackItem) => {
    setUploadingForId(item._id);
    adminVideoInputRef.current?.click();
  };

  const handleAdminVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingForId) return;

    const targetItem = feedbacks.find(f => f._id === uploadingForId);
    if (!targetItem) return;

    const videoKey = 'vid_' + Date.now();
    await saveVideoBlob(videoKey, file);

    let uploadedUrl = '';
    try {
      const uploadFd = new FormData();
      uploadFd.append('files', file);
      const apiRes = await fetch('/api/appointments/upload', {
        method: 'POST',
        body: uploadFd,
      });
      const data = await apiRes.json();
      if (data?.files?.[0]?.url) {
        uploadedUrl = data.files[0].url;
      }
    } catch (err) {
      console.warn('Server upload notice (using local blob):', err);
    }

    const videoSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    // Update local feedbacks
    const updated = feedbacks.map(f => {
      if (f._id === uploadingForId) {
        return {
          ...f,
          hasVideo: true,
          videoKey,
          videoUrl: uploadedUrl || f.videoUrl,
          videoName: file.name,
          videoSize,
        };
      }
      return f;
    });
    setFeedbacks(updated);
    localStorage.setItem('kayal_feedbacks', JSON.stringify(updated));

    if (adminVideoInputRef.current) adminVideoInputRef.current.value = '';
    setUploadingForId(null);
    showToast(`Video attached to ${targetItem.name}'s review successfully!`);
  };

  const filteredFeedbacks = feedbacks.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.phone.toLowerCase().includes(search.toLowerCase()) ||
    (f.subject && f.subject.toLowerCase().includes(search.toLowerCase())) ||
    f.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: '#160427',
          color: '#24E0E1',
          border: '2px solid #24E0E1',
          borderRadius: '12px',
          padding: '0.85rem 1.4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <CheckCircle size={18} color="#24E0E1" />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Hidden Admin Video Upload Input */}
        <input
          ref={adminVideoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          style={{ display: 'none' }}
          onChange={handleAdminVideoFileSelected}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#451271', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MessageSquare size={24} color="#24E0E1" /> Patient Feedback &amp; Messages
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', marginTop: '0.35rem' }}>
              Messages submitted via "Send Us a Message" on the contact page. (Auto-updating in real-time)
            </p>
          </div>
          <button
            onClick={loadFeedbacks}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #451271', background: 'white', color: '#451271', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh Messages
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, phone or message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '10px', fontSize: '0.88rem', width: '100%', padding: '0.5rem 0.5rem 0.5rem 38px' }}
          />
        </div>

        {/* List / Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid var(--gray-200)', overflow: 'hidden', width: '100%' }}>
          {filteredFeedbacks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#451271' }}>No Feedback Messages Found</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Messages submitted via the contact form will appear here automatically.</p>
            </div>
          ) : (
            <>
              <div className="desktop-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--gray-200)', color: '#451271', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1rem', width: '15%' }}>Patient Name &amp; Rating</th>
                      <th style={{ padding: '0.85rem 1rem', width: '17%' }}>Contact Info</th>
                      <th style={{ padding: '0.85rem 1rem', width: '13%' }}>Subject</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Message</th>
                      <th style={{ padding: '0.85rem 1rem', width: '13%', textAlign: 'center' }}>Feedback Video</th>
                      <th style={{ padding: '0.85rem 1rem', width: '11%', whiteSpace: 'nowrap' }}>Date &amp; Time</th>
                      <th style={{ padding: '0.85rem 1rem', width: '18%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedbacks.map((item) => (
                      <tr
                        key={item._id}
                        style={{
                          borderBottom: '1px solid var(--gray-100)',
                          background: item.status === 'unread' ? '#f0fdfa' : 'white',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#451271' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="#24E0E1" />
                            <span>{item.name}</span>
                            {item.status === 'unread' && (
                              <span style={{ fontSize: '0.68rem', background: '#24E0E1', color: '#451271', padding: '0.15rem 0.45rem', borderRadius: '50px', fontWeight: 800 }}>
                                NEW
                              </span>
                            )}
                          </div>
                          {/* Star Rating Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <Star
                                key={starIdx}
                                size={13}
                                fill={starIdx <= (item.rating || 5) ? '#eab308' : '#e2e8f0'}
                                color={starIdx <= (item.rating || 5) ? '#ca8a04' : '#cbd5e1'}
                              />
                            ))}
                            <span style={{ fontSize: '0.74rem', color: '#854d0e', fontWeight: 800, marginLeft: '4px' }}>
                              {item.rating || 5}/5
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#0284c7" /> {item.phone}
                            </span>
                            <span style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} color="#451271" /> {item.email}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--gray-800)' }}>
                          {item.subject || 'General Inquiry'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ color: 'var(--gray-600)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45, wordBreak: 'break-word' }}>
                            {item.message}
                          </div>
                        </td>

                        {/* Dedicated Feedback Video Column */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {item.hasVideo ? (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                              <button
                                type="button"
                                onClick={() => setActiveVideoItem(item)}
                                style={{
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #451271 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                                }}
                              >
                                <Play size={12} fill="white" /> Watch Video
                              </button>
                              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle size={11} /> Video Attached
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <button
                                type="button"
                                onClick={() => triggerAdminVideoUpload(item)}
                                style={{
                                  background: '#f8fafc',
                                  color: '#475569',
                                  border: '1.5px dashed #94a3b8',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                }}
                                title="Click to attach / upload a video for this patient"
                              >
                                <UploadCloud size={13} color="#64748b" /> + Upload Video
                              </button>
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>No video attached</span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                            {/* Always-Visible Publish to Testimonials Button */}
                            <button
                              onClick={() => handleTogglePublish(item)}
                              style={{
                                background: (publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id))
                                  ? '#dcfce7'
                                  : 'linear-gradient(135deg, #24E0E1 0%, #06b6d4 100%)',
                                color: (publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id))
                                  ? '#166534'
                                  : '#1c0533',
                                border: 'none',
                                padding: '0.4rem 0.7rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                whiteSpace: 'nowrap',
                              }}
                              title={(publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id)) ? 'Click to remove from public Testimonials page' : 'Click to publish this patient feedback to public Testimonials page'}
                            >
                              {(publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id)) ? (
                                <>
                                  <CheckCircle size={13} color="#166534" /> Live on Testimonials
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={13} color="#1c0533" /> Publish to Testimonials
                                </>
                              )}
                            </button>

                            {item.status === 'unread' && (
                              <button
                                onClick={() => handleMarkRead(item._id)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.74rem', borderRadius: '6px', border: '1px solid #451271', background: 'transparent', color: '#451271', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}
                                title="Mark as Read"
                              >
                                <CheckCircle size={13} /> Read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                              title="Delete Feedback"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Zero Horizontal Scroll!) */}
              <div className="mobile-cards-container">
                {filteredFeedbacks.map((item) => (
                  <div key={item._id} className="admin-mobile-card">
                    {/* Header: Patient Name, New Badge, Star Rating & Date */}
                    <div className="admin-mobile-card__header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <User size={16} color="#24E0E1" />
                          <span className="admin-mobile-card__patient-name">{item.name}</span>
                          {item.status === 'unread' && (
                            <span style={{ fontSize: '0.68rem', background: '#24E0E1', color: '#451271', padding: '0.15rem 0.45rem', borderRadius: '50px', fontWeight: 800 }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {/* Star Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <Star
                              key={starIdx}
                              size={13}
                              fill={starIdx <= (item.rating || 5) ? '#eab308' : '#e2e8f0'}
                              color={starIdx <= (item.rating || 5) ? '#ca8a04' : '#cbd5e1'}
                            />
                          ))}
                          <span style={{ fontSize: '0.74rem', color: '#854d0e', fontWeight: 800, marginLeft: '4px' }}>
                            {item.rating || 5}/5
                          </span>
                        </div>
                      </div>

                      <div className="admin-mobile-card__date-small" style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                        <Calendar size={12} color="#64748b" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div style={{ fontSize: '0.84rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Subject: </span>
                      <strong style={{ color: '#451271' }}>{item.subject || 'General Inquiry'}</strong>
                    </div>

                    {/* Contact Chips */}
                    <div className="admin-mobile-card__contact-chips">
                      <a href={`tel:${item.phone}`} className="admin-mobile-card__contact-chip">
                        <Phone size={12} color="#0284c7" />
                        <span>{item.phone}</span>
                      </a>
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="admin-mobile-card__contact-chip">
                          <Mail size={12} color="#451271" />
                          <span>{item.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Patient Message Box */}
                    <div className="admin-mobile-card__concern-box">
                      <div style={{ fontWeight: 700, marginBottom: '2px', color: '#581c87' }}>Patient Message:</div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#334155' }}>&ldquo;{item.message}&rdquo;</div>
                    </div>

                    {/* Feedback Video Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Video size={14} color="#7c3aed" /> Feedback Video:
                      </span>
                      {item.hasVideo ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setActiveVideoItem(item)}
                            style={{
                              background: 'linear-gradient(135deg, #7c3aed 0%, #451271 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <Play size={11} fill="white" /> Watch Video
                          </button>
                          <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle size={10} /> Attached
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerAdminVideoUpload(item)}
                          style={{
                            background: '#ffffff',
                            color: '#475569',
                            border: '1.5px dashed #94a3b8',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <UploadCloud size={12} color="#64748b" /> + Upload Video
                        </button>
                      )}
                    </div>

                    {/* Footer Actions: Publish to Testimonials, Mark Read, Delete */}
                    <div className="admin-mobile-card__footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleTogglePublish(item)}
                        style={{
                          background: (publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id))
                            ? '#dcfce7'
                            : 'linear-gradient(135deg, #24E0E1 0%, #06b6d4 100%)',
                          color: (publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id))
                            ? '#166534'
                            : '#1c0533',
                          border: 'none',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {(publishedKeys.has(item.videoKey || '') || publishedKeys.has(item.videoUrl || '') || publishedKeys.has(item._id)) ? (
                          <>
                            <CheckCircle size={13} color="#166534" /> Live on Testimonials
                          </>
                        ) : (
                          <>
                            <UploadCloud size={13} color="#1c0533" /> Publish to Testimonials
                          </>
                        )}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                        {item.status === 'unread' && (
                          <button
                            onClick={() => handleMarkRead(item._id)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              border: '1px solid #451271',
                              background: 'transparent',
                              color: '#451271',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <CheckCircle size={13} /> Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Video Player Modal */}
        {activeVideoItem && (
          <div
            onClick={e => { if (e.target === e.currentTarget) setActiveVideoItem(null); }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1rem 1.25rem',
                background: '#1c0533',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="#24E0E1" />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    Patient Feedback Video: {activeVideoItem.name}
                  </span>
                </div>
                <button
                  onClick={() => setActiveVideoItem(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Video Body */}
              <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px', maxHeight: '420px' }}>
                {activeVideoBlobUrl ? (
                  <video
                    key={activeVideoBlobUrl}
                    src={activeVideoBlobUrl}
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    style={{ width: '100%', maxHeight: '420px', display: 'block', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.7)', padding: '2rem', textAlign: 'center' }}>
                    Loading video stream...
                  </div>
                )}
              </div>

              {/* Modal Details & Action Bar */}
              <div style={{ padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.3rem' }}>
                    <strong>Subject:</strong> {activeVideoItem.subject || 'General Feedback'} · <strong>Patient:</strong> {activeVideoItem.name} ({activeVideoItem.phone})
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray-700)', margin: 0, fontStyle: 'italic', background: 'white', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    "{activeVideoItem.message}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {publishedKeys.has(activeVideoItem.videoKey || '') || publishedKeys.has(activeVideoItem.videoUrl || '') || publishedKeys.has(activeVideoItem._id) ? (
                      <span style={{ color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> Currently Live on User Testimonials Page
                      </span>
                    ) : (
                      <span>Ready to publish to the public Testimonials page</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleTogglePublish(activeVideoItem);
                      }}
                      style={{
                        background: publishedKeys.has(activeVideoItem.videoKey || '') || publishedKeys.has(activeVideoItem.videoUrl || '') || publishedKeys.has(activeVideoItem._id) ? '#fee2e2' : 'linear-gradient(135deg, #24E0E1 0%, #06b6d4 100%)',
                        color: publishedKeys.has(activeVideoItem.videoKey || '') || publishedKeys.has(activeVideoItem.videoUrl || '') || publishedKeys.has(activeVideoItem._id) ? '#ef4444' : '#1c0533',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {publishedKeys.has(activeVideoItem.videoKey || '') || publishedKeys.has(activeVideoItem.videoUrl || '') || publishedKeys.has(activeVideoItem._id) ? (
                        <>Remove from Testimonials</>
                      ) : (
                        <>
                          <UploadCloud size={16} /> Publish to Testimonials Page
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveVideoItem(null)}
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #451271', background: 'transparent', color: '#451271', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;

