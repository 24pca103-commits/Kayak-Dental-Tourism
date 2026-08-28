import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Users } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { doctorsAPI } from '../../services/api';
import type { Doctor } from '../../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY = { name: '', qualification: '', specialization: '', experience: '', description: '', availability: DAYS.slice(0, 6), status: 'active' };

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [loading, setLoading] = useState(false);

  const fetchDoctors = () => {
    doctorsAPI.getAllAdmin().then(r => setDoctors(r.data?.data || [])).catch(() => {});
  };

  useEffect(() => {
    document.title = 'Doctors | KAYAL Admin';
    fetchDoctors();
  }, []);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({ name: doc.name, qualification: doc.qualification, specialization: doc.specialization, experience: String(doc.experience), description: doc.description, availability: doc.availability, status: doc.status });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'availability') (v as string[]).forEach(d => fd.append('availability[]', d));
        else fd.append(k, v as string);
      });
      if (editing) await doctorsAPI.update(editing._id, fd);
      else await doctorsAPI.create(fd);
      setShowForm(false);
      fetchDoctors();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this doctor?')) return;
    await doctorsAPI.delete(id).catch(() => {});
    fetchDoctors();
  };

  const toggleDay = (day: string) => {
    setForm(p => ({
      ...p,
      availability: p.availability.includes(day) ? p.availability.filter(d => d !== day) : [...p.availability, day],
    }));
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Doctors</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{doctors.length} doctors registered</p>
          </div>
          <button className="btn btn-purple" onClick={openCreate}><Plus size={16} />Add Doctor</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {doctors.map(doc => (
            <div key={doc._id} style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 120, background: 'linear-gradient(135deg,var(--purple-50),var(--cyan-50))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {doc.image ? <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={40} style={{ color: 'var(--purple-300)' }} />}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-800)' }}>{doc.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--purple-600)', fontWeight: 600 }}>{doc.specialization}</p>
                  </div>
                  <span className={`badge ${doc.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`} style={{ fontSize: '0.7rem' }}>{doc.status}</span>
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>{doc.qualification} · {doc.experience}yrs</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(doc)} className="btn btn-outline-purple btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Edit2 size={13} />Edit</button>
                  <button onClick={() => handleDelete(doc._id)} style={{ width: 34, height: 34, borderRadius: 8, background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>No doctors yet. Add your first doctor.</div>}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, background: 'white' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{editing ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Full Name *', name: 'name', placeholder: 'Dr. ...' },
                  { label: 'Qualification *', name: 'qualification', placeholder: 'BDS, MDS' },
                  { label: 'Specialization *', name: 'specialization', placeholder: 'e.g. Orthodontist' },
                  { label: 'Experience (years)', name: 'experience', placeholder: '5', type: 'number' },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type || 'text'} name={f.name} placeholder={f.placeholder}
                      value={(form as unknown as Record<string, string>)[f.name]}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} required={f.label.includes('*')} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1.5px solid', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', background: form.availability.includes(d) ? 'var(--purple-600)' : 'white', borderColor: form.availability.includes(d) ? 'var(--purple-600)' : 'var(--gray-200)', color: form.availability.includes(d) ? 'white' : 'var(--gray-600)' }}>
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline-purple" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-purple" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDoctors;
