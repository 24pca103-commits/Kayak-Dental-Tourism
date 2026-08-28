import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Stethoscope } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { servicesAPI } from '../../services/api';
import type { Service } from '../../types';

const EMPTY = { name: '', shortDescription: '', description: '', benefits: '', treatmentProcess: '', whoNeeds: '', duration: '', status: 'active' };

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);

  const fetchData = () => servicesAPI.getAllAdmin().then(r => setServices(r.data?.data || [])).catch(() => {});

  useEffect(() => { document.title = 'Services | KAYAL Admin'; fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, shortDescription: s.shortDescription, description: s.description, benefits: s.benefits.join('\n'), treatmentProcess: s.treatmentProcess, whoNeeds: s.whoNeeds, duration: s.duration, status: s.status });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'benefits') v.split('\n').filter(Boolean).forEach((b: string) => fd.append('benefits[]', b));
        else fd.append(k, v);
      });
      if (editing) await servicesAPI.update(editing._id, fd);
      else await servicesAPI.create(fd);
      setShowForm(false);
      fetchData();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    await servicesAPI.delete(id).catch(() => {});
    fetchData();
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Services</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{services.length} services registered</p>
          </div>
          <button className="btn btn-purple" onClick={openCreate}><Plus size={16} />Add Service</button>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                {['Service', 'Slug', 'Duration', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                        <Stethoscope size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.shortDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}><code style={{ fontSize: '0.75rem', background: 'var(--gray-100)', padding: '0.2rem 0.4rem', borderRadius: 4 }}>{s.slug}</code></td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>{s.duration || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${s.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`} style={{ fontSize: '0.7rem' }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(s)} style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--purple-50)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)' }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s._id)} style={{ width: 30, height: 30, borderRadius: 6, background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>No services yet. Run the seed script or add manually.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, background: 'white' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" placeholder="e.g. Dental Implants" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Short Description *</label>
                <input className="form-input" placeholder="One-line description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 1–2 hours" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Benefits (one per line)</label>
                <textarea className="form-input" rows={4} placeholder="Natural appearance&#10;Long-lasting&#10;Painless" value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline-purple" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-purple" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
