import React, { useState, useEffect } from 'react';
import { Search, Trash2, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { appointmentsAPI } from '../../services/api';
import type { Appointment } from '../../types';

const STATUS_OPTS = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];
const STATUS_STYLE: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed',
  completed: 'status-completed', cancelled: 'status-cancelled', rescheduled: 'status-rescheduled'
};

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: 100 };
    if (filterStatus) params.status = filterStatus;
    appointmentsAPI.getAll(params)
      .then(r => setAppointments(r.data?.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [filterStatus]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentsAPI.update(id, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: status as Appointment['status'] } : a));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await appointmentsAPI.delete(id);
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch {}
  };

  const filtered = appointments.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.phone.includes(search) ||
    (a.serviceName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Appointments</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage and update appointment statuses</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 8, padding: '0.5rem 1rem', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ color: 'var(--gray-400)' }} />
            <input type="text" placeholder="Search by name, phone, service..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '0.875rem', flex: 1 }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: '0.875rem', outline: 'none', background: 'white', minWidth: 160 }}>
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>No appointments found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    {['Patient', 'Contact', 'Service', 'Doctor', 'Date & Time', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => (
                    <tr key={appt._id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{new Date(appt.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>
                        <div>{appt.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.email}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>{appt.serviceName || '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>{appt.doctorName || 'Any'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                        {new Date(appt.appointmentDate).toLocaleDateString()}<br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.appointmentTime}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select
                            value={appt.status}
                            onChange={e => handleStatusChange(appt._id, e.target.value)}
                            className={`badge ${STATUS_STYLE[appt.status]}`}
                            style={{ border: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '1.5rem', fontWeight: 600 }}
                          >
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: 4, pointerEvents: 'none' }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => handleDelete(appt._id)} style={{ width: 30, height: 30, borderRadius: 6, background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
