import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Star, Video } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { testimonialsAPI } from '../../services/api';
import type { Testimonial } from '../../types';
import {
  getPublishedVideos,
  unpublishVideo,
  getVideoBlobUrl,
  type PublishedVideoTestimonial,
} from '../../utils/videoStorage';

const EMPTY = { patientName: '', review: '', rating: '5', status: 'active' };

interface VideoCardItem extends PublishedVideoTestimonial {
  videoUrl?: string;
}

const AdminTestimonials: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoCardItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);


  const fetchVideoTestimonials = async () => {
    const list = getPublishedVideos();
    const mapped: VideoCardItem[] = [];
    for (const item of list) {
      const url = await getVideoBlobUrl(item.videoKey);
      mapped.push({ ...item, videoUrl: url || undefined });
    }
    setVideoTestimonials(mapped);
  };

  const fetchData = () => {
    testimonialsAPI.getAllAdmin().then(r => setItems(r.data?.data || [])).catch(() => {});
    fetchVideoTestimonials();
  };

  useEffect(() => {
    document.title = 'Testimonials | KAYAL Admin';
    fetchData();

    window.addEventListener('storage', fetchVideoTestimonials);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kayal_live_sync');
      bc.onmessage = () => fetchVideoTestimonials();
    } catch {}

    return () => {
      window.removeEventListener('storage', fetchVideoTestimonials);
      if (bc) bc.close();
    };
  }, []);

  const handleUnpublishVideo = (item: VideoCardItem) => {
    if (window.confirm(`Remove video testimonial by ${item.patientName} from public Testimonials page?`)) {
      unpublishVideo(item._id);
      fetchVideoTestimonials();
    }
  };

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ patientName: t.patientName, review: t.review, rating: String(t.rating), status: t.status }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('patientName', form.patientName); fd.append('review', form.review); fd.append('rating', form.rating); fd.append('status', form.status);
      if (editing) await testimonialsAPI.update(editing._id, fd);
      else await testimonialsAPI.create(fd);
      setShowForm(false);
      fetchData();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete?')) return;
    await testimonialsAPI.delete(id).catch(() => {});
    fetchData();
  };

  const toggleStatus = async (t: Testimonial) => {
    const fd = new FormData();
    fd.append('status', t.status === 'active' ? 'inactive' : 'active');
    await testimonialsAPI.update(t._id, fd).catch(() => {});
    fetchData();
  };


  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Testimonials</h1><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{items.length} testimonials</p></div>
          <button className="btn btn-purple" onClick={openCreate}><Plus size={16} />Add Testimonial</button>
        </div>

        {/* Published Video Testimonials Section */}
        {videoTestimonials.length > 0 && (
          <div style={{ marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1.5px solid #24E0E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#451271', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={20} color="#24E0E1" /> Published Patient Video Reviews ({videoTestimonials.length})
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: '0.2rem 0 0 0' }}>
                  User-submitted videos approved from Contact Messages &amp; live on the public Testimonials page.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {videoTestimonials.map(v => (
                <div key={v._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                    {v.videoUrl ? (
                      <video
                        src={v.videoUrl}
                        controls
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontSize: '0.8rem' }}>
                        Loading video...
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: '#451271', fontSize: '0.95rem' }}>{v.patientName}</span>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {Array.from({ length: v.rating || 5 }).map((_, i) => (
                          <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: '#24E0E1', color: '#1c0533', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                      {v.tag || 'Patient Review'}
                    </span>
                    {v.message && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', margin: '0 0 1rem 0', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{v.message}"
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleUnpublishVideo(v)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                        title="Remove from public Testimonials"
                      >
                        <Trash2 size={13} /> Remove Video
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
          {items.map(t => (
            <div key={t._id} style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <span className={`badge ${t.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`} style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => toggleStatus(t)}>{t.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{t.review}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>— {t.patientName}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => openEdit(t)} style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--purple-50)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)' }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(t._id)} style={{ width: 28, height: 28, borderRadius: 6, background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>No testimonials yet.</div>}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, background: 'white' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{editing ? 'Edit' : 'Add'} Testimonial</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input className="form-input" value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Review *</label>
                <textarea className="form-input" rows={4} value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select className="form-input" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline-purple" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-purple" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTestimonials;
