import React, { useState, useEffect } from 'react';
import { Calendar, Users, Stethoscope, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { appointmentsAPI, doctorsAPI, servicesAPI } from '../../services/api';
import type { AppointmentStats, Appointment } from '../../types';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; bg: string }> = ({
  icon, label, value, color, bg
}) => (
  <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ width: 52, height: 52, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-800)', lineHeight: 1.1 }}>{value}</p>
    </div>
  </div>
);

const STATUS_STYLE: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  rescheduled: 'status-rescheduled',
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [recent, setRecent] = useState<Appointment[]>([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);

  useEffect(() => {
    document.title = 'Dashboard | KAYAL Admin';
    Promise.all([
      appointmentsAPI.getStats(),
      appointmentsAPI.getAll({ limit: 5 }),
      doctorsAPI.getAllAdmin(),
      servicesAPI.getAllAdmin(),
    ]).then(([statsRes, recentRes, docRes, svcRes]) => {
      setStats(statsRes.data?.data || {});
      setRecent(recentRes.data?.data || []);
      setDoctorCount((docRes.data?.data || []).length);
      setServiceCount((svcRes.data?.data || []).length);
    }).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Welcome back! Here's what's happening at KAYAL Dental.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={<Calendar size={22} />} label="Total Appointments" value={stats.total} color="var(--purple-600)" bg="var(--purple-50)" />
          <StatCard icon={<Clock size={22} />} label="Pending" value={stats.pending} color="#92400e" bg="#fef3c7" />
          <StatCard icon={<CheckCircle size={22} />} label="Confirmed" value={stats.confirmed} color="#065f46" bg="#d1fae5" />
          <StatCard icon={<TrendingUp size={22} />} label="Completed" value={stats.completed} color="#1e40af" bg="#dbeafe" />
          <StatCard icon={<XCircle size={22} />} label="Cancelled" value={stats.cancelled} color="#991b1b" bg="#fee2e2" />
          <StatCard icon={<Users size={22} />} label="Doctors" value={doctorCount} color="var(--cyan-600)" bg="var(--cyan-50)" />
          <StatCard icon={<Stethoscope size={22} />} label="Services" value={serviceCount} color="var(--purple-600)" bg="var(--purple-50)" />
        </div>

        {/* Recent Appointments */}
        <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-800)' }}>Recent Appointments</h2>
            <a href="/admin/appointments" style={{ fontSize: '0.8rem', color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none' }}>View All →</a>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
              No appointments yet. Run the seed script or book via the website.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    {['Patient', 'Service', 'Date', 'Time', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(appt => (
                    <tr key={appt._id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                      <td style={{ padding: '0.875rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{appt.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{appt.phone}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{appt.serviceName || '—'}</td>
                      <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{appt.appointmentTime}</td>
                      <td style={{ padding: '0.875rem 1.5rem' }}>
                        <span className={`badge ${STATUS_STYLE[appt.status]}`} style={{ fontSize: '0.75rem' }}>{appt.status}</span>
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

export default AdminDashboard;
