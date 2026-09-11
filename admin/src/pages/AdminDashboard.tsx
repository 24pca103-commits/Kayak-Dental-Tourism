import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, User, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { appointmentsAPI } from '../services/api';
import type { Appointment } from '../types';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveAppointments = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await appointmentsAPI.getAll({ limit: 100 });
      const apiData: Appointment[] = res.data?.data || [];

      // Local fallback merge
      let localData: Appointment[] = [];
      try {
        localData = JSON.parse(localStorage.getItem('kayal_local_appointments') || '[]');
      } catch { }
      const existingIds = new Set(apiData.map(a => a._id));
      const merged = [...apiData, ...localData.filter(l => !existingIds.has(l._id))];

      setAppointments(merged);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      try {
        const local: Appointment[] = JSON.parse(localStorage.getItem('kayal_local_appointments') || '[]');
        setAppointments(local);
      } catch {
        setAppointments([]);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAppointments(true);

    // Real-time live polling every 2.5 seconds
    const interval = setInterval(() => {
      fetchLiveAppointments(false);
    }, 2500);

    // Instant cross-tab broadcast channel sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('kayal_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_APPOINTMENT' || event.data?.type === 'STATUS_UPDATED') {
          fetchLiveAppointments(false);
        }
      };
    } catch {}

    // Instant refresh when admin tab gains focus or becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveAppointments(false);
      }
    };
    const handleFocus = () => {
      fetchLiveAppointments(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  const STAT_CARDS = [
    { label: 'Total Bookings', count: total, icon: <Calendar size={24} color="#451271" />, bg: '#f5eeff', border: '#b07fd8' },
    { label: 'Pending Action', count: pending, icon: <AlertCircle size={24} color="#b45309" />, bg: '#fef3c7', border: '#fde68a' },
    { label: 'Confirmed', count: confirmed, icon: <CheckCircle size={24} color="#047857" />, bg: '#d1fae5', border: '#a7f3d0' },
    { label: 'Completed Care', count: completed, icon: <Clock size={24} color="#1d4ed8" />, bg: '#dbeafe', border: '#bfdbfe' },
  ];

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-800)' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Welcome to Kayal Dental Tourism Admin Portal
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '50px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #86efac'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
              Live MySQL Sync {lastUpdated && `(${lastUpdated})`}
            </span>

            <button
              onClick={() => fetchLiveAppointments(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--gray-300)',
                background: 'white',
                color: 'var(--gray-700)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {STAT_CARDS.map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: `1px solid ${card.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gray-900)' }}>{card.count}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Recent Bookings Table */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>Recent Patient Bookings (Live)</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Real-time bookings from website and consultation forms</p>
            </div>
            <Link to="/appointments" style={{ fontSize: '0.85rem', color: '#451271', fontWeight: 600, textDecoration: 'none' }}>
              View All Bookings &rarr;
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              {loading ? 'Connecting to MySQL database...' : 'No appointments in database yet.'}
            </div>
          ) : (
            <>
              <div className="desktop-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Patient</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Contact</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Treatments</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Dental Photos</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Date &amp; Time</th>
                    <th style={{ padding: '0.85rem 1.25rem', color: 'var(--gray-600)', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 8).map(apt => {
                    let attCount = 0;
                    try {
                      if (apt.attachments) {
                        const parsed = typeof apt.attachments === 'string' ? JSON.parse(apt.attachments) : apt.attachments;
                        if (Array.isArray(parsed)) attCount = parsed.length;
                      }
                    } catch { }

                    return (
                      <tr key={apt._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--gray-800)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={15} color="#6b7280" />
                            <span>{apt.patientName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--gray-600)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone size={12} color="#9ca3af" /> {apt.phone}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={12} color="#9ca3af" /> {apt.email}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                          {apt.serviceName || 'General Consultation'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {attCount > 0 ? (
                            <Link
                              to="/appointments"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                              }}
                              title="View uploaded photos in Appointments page"
                            >
                              📷 {attCount} {attCount === 1 ? 'Photo' : 'Photos'}
                            </Link>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--gray-600)', fontSize: '0.82rem' }}>
                          <div>{new Date(apt.appointmentDate).toLocaleDateString()}</div>
                          <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{apt.appointmentTime}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            background: apt.status === 'confirmed' ? '#d1fae5' : apt.status === 'completed' ? '#dbeafe' : apt.status === 'rescheduled' ? '#fef3c7' : apt.status === 'cancelled' ? '#fee2e2' : '#f1f5f9',
                            color: apt.status === 'confirmed' ? '#047857' : apt.status === 'completed' ? '#1d4ed8' : apt.status === 'rescheduled' ? '#b45309' : apt.status === 'cancelled' ? '#dc2626' : '#475569',
                          }}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Zero Horizontal Scroll!) */}
            <div className="mobile-cards-container">
              {appointments.slice(0, 8).map((apt) => {
                let attCount = 0;
                try {
                  if (apt.attachments) {
                    const parsed = typeof apt.attachments === 'string' ? JSON.parse(apt.attachments) : apt.attachments;
                    if (Array.isArray(parsed)) attCount = parsed.length;
                  }
                } catch { }

                return (
                  <div key={apt._id} className="admin-mobile-card">
                    {/* Header: Name + Status */}
                    <div className="admin-mobile-card__header">
                      <div>
                        <div className="admin-mobile-card__patient-name">{apt.patientName}</div>
                        <div className="admin-mobile-card__date-small">
                          📅 {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background:
                            apt.status === 'confirmed'
                              ? '#d1fae5'
                              : apt.status === 'completed'
                              ? '#dbeafe'
                              : apt.status === 'rescheduled'
                              ? '#fef3c7'
                              : apt.status === 'cancelled'
                              ? '#fee2e2'
                              : '#f1f5f9',
                          color:
                            apt.status === 'confirmed'
                              ? '#047857'
                              : apt.status === 'completed'
                              ? '#1d4ed8'
                              : apt.status === 'rescheduled'
                              ? '#b45309'
                              : apt.status === 'cancelled'
                              ? '#dc2626'
                              : '#475569',
                        }}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* Treatment / Service */}
                    <div className="admin-mobile-card__row">
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Treatment:</span>
                      <strong style={{ color: '#1e293b' }}>{apt.serviceName || 'General Consultation'}</strong>
                    </div>

                    {/* Contact Buttons */}
                    <div className="admin-mobile-card__contact-chips">
                      <a href={`tel:${apt.phone}`} className="admin-mobile-card__contact-chip">
                        <Phone size={13} color="#059669" />
                        <span>{apt.phone}</span>
                      </a>
                      {apt.email && (
                        <a href={`mailto:${apt.email}`} className="admin-mobile-card__contact-chip">
                          <Mail size={13} color="#2563eb" />
                          <span>{apt.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Photos and Link */}
                    <div className="admin-mobile-card__footer">
                      {attCount > 0 ? (
                        <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                          📷 {attCount} {attCount === 1 ? 'Photo' : 'Photos'} Attached
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No attachments</span>
                      )}

                      <Link
                        to="/appointments"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#451271',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Manage &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
