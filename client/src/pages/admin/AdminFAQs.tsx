import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, GripVertical } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { faqsAPI } from '../../services/api';
import type { FAQ } from '../../types';

const EMPTY = { question: '', answer: '', displayOrder: '0', status: 'active' };

const AdminFAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);

  const fetchData = () => faqsAPI.getAllAdmin().then(r => setFaqs(r.data?.data || [])).catch(() => {});
  useEffect(() => { document.title = 'FAQs | KAYAL Admin'; fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, displayOrder: String(faqs.length + 1) }); setShowForm(true); };
  const openEdit = (f: FAQ) => { setEditing(f); setForm({ question: f.question, answer: f.answer, displayOrder: String(f.displayOrder), status: f.status }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { question: form.question, answer: form.answer, displayOrder: Number(form.displayOrder), status: form.status };
      if (editing) await faqsAPI.update(editing._id, data);
      else await faqsAPI.create(data);
      setShowForm(false);
      fetchData();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ?')) return;
    await faqsAPI.delete(id).catch(() => {});
    fetchData();
  };

  const toggleStatus = async (f: FAQ) => {
    await faqsAPI.update(f._id, { status: f.status === 'active' ? 'inactive' : 'active' }).catch(() => {});
    fetchData();
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div><h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>FAQs</h1><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{faqs.length} questions</p></div>
          <button className="btn btn-purple" onClick={openCreate}><Plus size={16} />Add FAQ</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map(faq => (
            <div key={faq._id} style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ color: 'var(--gray-300)', paddingTop: 2 }}><GripVertical size={16} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-700)' }}>{faq.question}</span>
                  <span className={`badge ${faq.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`} style={{ fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }} onClick={() => toggleStatus(faq)}>{faq.status}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{faq.answer}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(faq)} style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--purple-50)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)' }}><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(faq._id)} style={{ width: 30, height: 30, borderRadius: 6, background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>No FAQs yet. Run seed or add manually.</div>}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, background: 'white' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{editing ? 'Edit' : 'Add'} FAQ</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Question *</label>
                <input className="form-input" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Answer *</label>
                <textarea className="form-input" rows={4} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.displayOrder} onChange={e => setForm(p => ({ ...p, displayOrder: e.target.value }))} />
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
                <button type="submit" className="btn btn-purple" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add FAQ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFAQs;
