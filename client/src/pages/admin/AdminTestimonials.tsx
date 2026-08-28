import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Star } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { testimonialsAPI } from '../../services/api';
import type { Testimonial } from '../../types';

const EMPTY = { patientName: '', review: '', rating: '5', status: 'active' };

const AdminTestimonials: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);

  const fetchData = () => testimonialsAPI.getAllAdmin().then(r => setItems(r.data?.data || [])).catch(() => {});
  useEffect(() => { document.title = 'Testimonials | KAYAL Admin'; fetchData(); }, []);

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
