import React, { useState, useEffect } from 'react';
import { Search, Trash2, ChevronDown, RefreshCw, Eye, Image as ImageIcon, FileText, Download, ExternalLink, X, Phone, Mail, CheckCircle2, Clock, Check, Send, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import { appointmentsAPI } from '../services/api';
import { sendStatusEmailNotification } from '../services/emailService';
import type { Appointment } from '../types';
import { ALLOWED_STATUS_TRANSITIONS, STATUS_LABELS } from '../types';

interface AttachmentItem {
  name: string;
  filename?: string;
  url: string;
  size?: number;
  type?: string;
}

const parseAttachments = (raw?: string): AttachmentItem[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isImageFile = (att: AttachmentItem) => {
  if (att.type?.startsWith('image/')) return true;
  if (att.url?.startsWith('data:image/')) return true;
  return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.url || att.name);
};

const STATUS_OPTS = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];
const STATUS_STYLE: Record<string, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  rescheduled: 'status-rescheduled',
};

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; name: string } | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Reschedule Modal State
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('10:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState<string>('');

  // Cancel Modal State
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Patient unable to arrange treatment fees / budget');
  const [cancelCustomNote, setCancelCustomNote] = useState<string>('');

  const fetchData = (showLoading = false) => {
    if (showLoading) setLoading(true);
    const params: Record<string, string | number> = { limit: 100 };
    if (filterStatus) params.status = filterStatus;

    const getLocal = (): Appointment[] => {
      try {
        return JSON.parse(localStorage.getItem('kayal_local_appointments') || '[]');
      } catch {
        return [];
      }
    };

    appointmentsAPI
      .getAll(params)
      .then((r) => {
        const apiData: Appointment[] = r.data?.data || [];
        const localData = getLocal();
        const existingIds = new Set(apiData.map((a) => a._id));
        const merged = [...apiData, ...localData.filter((l) => !existingIds.has(l._id))];
        setAppointments(filterStatus ? merged.filter((a) => a.status === filterStatus) : merged);
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(() => {
        const localData = getLocal();
        setAppointments(filterStatus ? localData.filter((a) => a.status === filterStatus) : localData);
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(true);
    // Real-time live polling every 3.5 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleStatusChange = async (
    id: string,
    newStatus: string,
    options?: {
      date?: string;
      time?: string;
      adminNote?: string;
    }
  ) => {
    const appt = appointments.find((a) => a._id === id);
    if (!appt) return;

    if (appt.status === newStatus && !options?.date && !options?.time) return;

    const allowed = ALLOWED_STATUS_TRANSITIONS[appt.status] || [];
    if (!allowed.includes(newStatus) && appt.status !== newStatus) {
      toast.error(
        `Invalid status order! You cannot jump from "${STATUS_LABELS[appt.status] || appt.status}" directly to "${STATUS_LABELS[newStatus] || newStatus}". Allowed steps: ${allowed.map((s) => STATUS_LABELS[s] || s).join(', ')}`,
        { duration: 5000 }
      );
      return;
    }

    setUpdatingStatusId(id);
    const toastId = toast.loading(`Updating status to "${STATUS_LABELS[newStatus] || newStatus}" & emailing patient...`);

    try {
      // 1. Update database
      const payload: Record<string, any> = { status: newStatus };
      if (options?.date) payload.appointmentDate = options.date;
      if (options?.time) payload.appointmentTime = options.time;
      if (options?.adminNote !== undefined) payload.adminNote = options.adminNote;

      await appointmentsAPI.update(id, payload);

      // 2. Send email notification to user
      let emailSent = false;
      if (appt.email) {
        emailSent = await sendStatusEmailNotification({
          name: appt.patientName,
          email: appt.email,
          phone: appt.phone,
          serviceName: appt.serviceName,
          appointmentDate: options?.date || appt.appointmentDate,
          appointmentTime: options?.time || appt.appointmentTime,
          status: newStatus,
          previousStatus: appt.status,
          adminNote: options?.adminNote,
        });
      }

      // 3. Update local state
      setAppointments((prev) => {
        const updated = prev.map((a) => {
          if (a._id !== id) return a;
          return {
            ...a,
            status: newStatus as Appointment['status'],
            appointmentDate: options?.date || a.appointmentDate,
            appointmentTime: options?.time || a.appointmentTime,
            adminNote: options?.adminNote !== undefined ? options.adminNote : a.adminNote,
          };
        });
        try {
          localStorage.setItem('kayal_local_appointments', JSON.stringify(updated));
        } catch { }
        return updated;
      });

      if (selectedAppt && selectedAppt._id === id) {
        setSelectedAppt((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus as Appointment['status'],
                appointmentDate: options?.date || prev.appointmentDate,
                appointmentTime: options?.time || prev.appointmentTime,
                adminNote: options?.adminNote !== undefined ? options.adminNote : prev.adminNote,
              }
            : null
        );
      }

      if (emailSent) {
        toast.success(`Status updated to "${STATUS_LABELS[newStatus] || newStatus}"! Notification email sent to ${appt.email}`, { id: toastId, duration: 4000 });
      } else {
        toast.success(`Status updated to "${STATUS_LABELS[newStatus] || newStatus}" in MySQL!`, { id: toastId, duration: 3500 });
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg, { id: toastId, duration: 4000 });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleModalAppt(appt);
    try {
      const d = new Date(appt.appointmentDate);
      setRescheduleDate(!isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '');
    } catch {
      setRescheduleDate('');
    }
    setRescheduleTime(appt.appointmentTime || '10:00 AM');
    setRescheduleNote(appt.adminNote || 'Doctor unavailable on requested date, shifted to next available slot.');
  };

  const submitReschedule = async () => {
    if (!rescheduleModalAppt) return;
    if (!rescheduleDate) {
      toast.error('Please select a new appointment date');
      return;
    }
    await handleStatusChange(rescheduleModalAppt._id, 'rescheduled', {
      date: rescheduleDate,
      time: rescheduleTime,
      adminNote: rescheduleNote,
    });
    setRescheduleModalAppt(null);
  };

  const openCancelModal = (appt: Appointment) => {
    setCancelModalAppt(appt);
    setCancelReason('Patient unable to arrange treatment fees / budget');
    setCancelCustomNote('');
  };

  const submitCancel = async () => {
    if (!cancelModalAppt) return;
    const finalNote = cancelCustomNote
      ? `${cancelReason} - ${cancelCustomNote}`
      : cancelReason;
    await handleStatusChange(cancelModalAppt._id, 'cancelled', {
      adminNote: finalNote,
    });
    setCancelModalAppt(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment from database?')) return;
    try {
      await appointmentsAPI.delete(id);
    } catch { }
    setAppointments((prev) => {
      const updated = prev.filter((a) => a._id !== id);
      try {
        localStorage.setItem('kayal_local_appointments', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const filtered = appointments.filter(
    (a) =>
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.includes(search) ||
      a.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-800)' }}>Bookings &amp; Appointments</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Live real-time patient appointments synced directly with MySQL database
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
              onClick={() => fetchData(true)}
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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              flex: 1,
              minWidth: 200,
            }}
          >
            <Search size={16} style={{ color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, email,treatment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', flex: 1 }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 8,
              fontSize: '0.875rem',
              outline: 'none',
              background: 'white',
              minWidth: 160,
            }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: 'white',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          {loading && appointments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              Loading appointments from MySQL...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              No appointments found in database.
            </div>
          ) : (
            <>
              <div className="desktop-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    {['Patient', 'Contact', 'Treatment / Concern', 'Dental Photos / Files', 'Doctor', 'Date & Time', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--gray-500)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt) => {
                    const atts = parseAttachments(appt.attachments);
                    const firstImg = atts.find(isImageFile);

                    return (
                      <tr key={appt._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.patientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {new Date(appt.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>
                          <div>{appt.phone}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.email}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{appt.serviceName || 'Consultation'}</div>
                          {appt.message && (
                            <div
                              onClick={() => setSelectedAppt(appt)}
                              style={{
                                fontSize: '0.75rem',
                                color: '#6b21a8',
                                background: '#faf5ff',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                marginTop: '4px',
                                cursor: 'pointer',
                                display: 'inline-block',
                                maxWidth: '200px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title="Click to view full dental concern"
                            >
                              "{appt.message}"
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {atts.length > 0 ? (
                            <button
                              onClick={() => setSelectedAppt(appt)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                border: '1.5px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title="Click to view patient uploaded dental photos & X-rays"
                            >
                              {firstImg ? (
                                <img
                                  src={firstImg.url}
                                  alt="Thumb"
                                  style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                              ) : (
                                <ImageIcon size={15} color="#2563eb" />
                              )}
                              <span>{atts.length} {atts.length === 1 ? 'Photo / File' : 'Photos / Files'}</span>
                            </button>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)' }}>
                          {appt.doctorName || 'Any Specialist'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{appt.appointmentTime}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <select
                              value={appt.status}
                              disabled={updatingStatusId === appt._id}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'rescheduled') {
                                  openRescheduleModal(appt);
                                } else if (val === 'cancelled') {
                                  openCancelModal(appt);
                                } else {
                                  handleStatusChange(appt._id, val);
                                }
                              }}
                              className={`badge ${STATUS_STYLE[appt.status]}`}
                              style={{
                                border: 'none',
                                cursor: updatingStatusId === appt._id ? 'wait' : 'pointer',
                                appearance: 'none',
                                paddingRight: '1.5rem',
                                fontWeight: 700,
                                opacity: updatingStatusId === appt._id ? 0.7 : 1,
                              }}
                              title={`Current: ${STATUS_LABELS[appt.status] || appt.status}`}
                            >
                              <option value={appt.status} disabled>
                                {STATUS_LABELS[appt.status] || appt.status} (Current)
                              </option>
                              {(ALLOWED_STATUS_TRANSITIONS[appt.status] || []).map((s) => (
                                <option key={s} value={s}>
                                  &rarr; {s === 'rescheduled' ? 'Reschedule' : s === 'confirmed' ? 'Confirm' : s === 'completed' ? 'Complete Care' : s === 'cancelled' ? 'Cancel' : 'Re-open'}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={12} style={{ position: 'absolute', right: 4, pointerEvents: 'none' }} />
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedAppt(appt)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: '#e0f2fe',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0284c7',
                              }}
                              title="View Details, Dental Concern & Uploaded Photos"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(appt._id)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: '#fee2e2',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                              }}
                              title="Delete appointment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

              {/* Mobile Card View (Zero Horizontal Scroll!) */}
              <div className="mobile-cards-container">
                {filtered.map((appt) => {
                  const atts = parseAttachments(appt.attachments);
                  const firstImg = atts.find(isImageFile);

                  return (
                    <div key={appt._id} className="admin-mobile-card">
                      {/* Header: Name, Created Date & Status Dropdown */}
                      <div className="admin-mobile-card__header">
                        <div>
                          <div className="admin-mobile-card__patient-name">{appt.patientName}</div>
                          <div className="admin-mobile-card__date-small">
                            Booked on {new Date(appt.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select
                            value={appt.status}
                            disabled={updatingStatusId === appt._id}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'rescheduled') {
                                openRescheduleModal(appt);
                              } else if (val === 'cancelled') {
                                openCancelModal(appt);
                              } else {
                                handleStatusChange(appt._id, val);
                              }
                            }}
                            className={`badge ${STATUS_STYLE[appt.status]}`}
                            style={{
                              border: 'none',
                              cursor: updatingStatusId === appt._id ? 'wait' : 'pointer',
                              appearance: 'none',
                              paddingRight: '1.4rem',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            <option value={appt.status} disabled>
                              {STATUS_LABELS[appt.status] || appt.status}
                            </option>
                            {(ALLOWED_STATUS_TRANSITIONS[appt.status] || []).map((s) => (
                              <option key={s} value={s}>
                                &rarr; {s === 'rescheduled' ? 'Reschedule' : s === 'confirmed' ? 'Confirm' : s === 'completed' ? 'Complete Care' : s === 'cancelled' ? 'Cancel' : 'Re-open'}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} style={{ position: 'absolute', right: 4, pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* Preferred Date & Time */}
                      <div className="admin-mobile-card__row">
                        <Clock size={14} color="#6b7280" />
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          <strong>{new Date(appt.appointmentDate).toLocaleDateString()}</strong> at {appt.appointmentTime}
                        </span>
                      </div>

                      {/* Treatment & Doctor */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Treatment: </span>
                          <strong style={{ color: '#1e293b' }}>{appt.serviceName || 'General Consultation'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Doctor: </span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{appt.doctorName || 'Any Specialist'}</span>
                        </div>
                      </div>

                      {/* Contact Chips */}
                      <div className="admin-mobile-card__contact-chips">
                        <a href={`tel:${appt.phone}`} className="admin-mobile-card__contact-chip">
                          <Phone size={12} color="#059669" />
                          <span>{appt.phone}</span>
                        </a>
                        {appt.email && (
                          <a href={`mailto:${appt.email}`} className="admin-mobile-card__contact-chip">
                            <Mail size={12} color="#2563eb" />
                            <span>{appt.email}</span>
                          </a>
                        )}
                      </div>

                      {/* Dental Concern Snippet if any */}
                      {appt.message && (
                        <div
                          className="admin-mobile-card__concern-box"
                          onClick={() => setSelectedAppt(appt)}
                          title="Tap to read full dental concern"
                        >
                          <strong>Dental Concern:</strong> &ldquo;{appt.message}&rdquo;
                        </div>
                      )}

                      {/* Card Footer: Photos Count & Action Buttons */}
                      <div className="admin-mobile-card__footer">
                        {atts.length > 0 ? (
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '8px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {firstImg ? (
                              <img
                                src={firstImg.url}
                                alt="Thumb"
                                style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            ) : (
                              <ImageIcon size={14} color="#2563eb" />
                            )}
                            <span>{atts.length} {atts.length === 1 ? 'File' : 'Files'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No attachments</span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '8px',
                              background: '#451271',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </button>

                          <button
                            onClick={() => handleDelete(appt._id)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: '#fee2e2',
                              color: '#ef4444',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                            title="Delete appointment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Patient Details & Uploaded Dental Photos Modal */}
      {selectedAppt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedAppt(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.2rem 0.6rem', borderRadius: '50px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {selectedAppt.serviceName || 'Consultation'}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedAppt.patientName}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Submitted on {new Date(selectedAppt.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contact info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Phone / WhatsApp</span>
                <a
                  href={`https://wa.me/${selectedAppt.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}
                >
                  <Phone size={14} /> {selectedAppt.phone} ↗
                </a>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Email Address</span>
                <a
                  href={`mailto:${selectedAppt.email}`}
                  style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}
                >
                  <Mail size={14} /> {selectedAppt.email}
                </a>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Preferred Date / Slot</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'block', marginTop: '2px' }}>
                  {new Date(selectedAppt.appointmentDate).toLocaleDateString()} ({selectedAppt.appointmentTime})
                </span>
              </div>
            </div>

            {/* Sequential Status Order Pipeline & Actions */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Appointment Status
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Status change automatically sends notification email to {selectedAppt.email}
                </span>
              </div>

              {/* Visual Stepper without scrollbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'pending', label: '1. Pending Review', icon: Clock },
                  { key: 'rescheduled', label: '2. Rescheduled', icon: Calendar },
                  { key: 'confirmed', label: '3. Confirmed', icon: CheckCircle2 },
                  { key: 'completed', label: '4. Completed Care', icon: Check },
                ].map((step, idx) => {
                  const statusOrder = ['pending', 'rescheduled', 'confirmed', 'completed'];
                  const currentIdx = statusOrder.indexOf(selectedAppt.status);
                  const isCurrent = selectedAppt.status === step.key;
                  const isPast = currentIdx !== -1 && idx < currentIdx;
                  const StepIcon = step.icon;

                  return (
                    <React.Fragment key={step.key}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 800 : 600,
                          background: isCurrent ? '#451271' : isPast ? '#dcfce7' : '#f1f5f9',
                          color: isCurrent ? '#ffffff' : isPast ? '#15803d' : '#94a3b8',
                          border: isCurrent ? '1.5px solid #24E0E1' : isPast ? '1px solid #86efac' : '1px solid #e2e8f0',
                        }}
                      >
                        <StepIcon size={14} />
                        <span>{step.label}</span>
                      </div>
                      {idx < 3 && (
                        <div style={{ height: '2px', width: '16px', background: isPast ? '#22c55e' : '#cbd5e1', flexShrink: 0 }} />
                      )}
                    </React.Fragment>
                  );
                })}

                {selectedAppt.status === 'cancelled' && (
                  <div style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} />
                    <span>Cancelled Booking</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Short, clear & intuitive) */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {(ALLOWED_STATUS_TRANSITIONS[selectedAppt.status] || []).map((nextStep) => {
                  if (nextStep === 'rescheduled') {
                    return (
                      <button
                        key={nextStep}
                        disabled={updatingStatusId === selectedAppt._id}
                        onClick={() => openRescheduleModal(selectedAppt)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: updatingStatusId === selectedAppt._id ? 'wait' : 'pointer',
                          border: 'none',
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                        }}
                        title="Pick new date & time slot for patient"
                      >
                        <Calendar size={15} />
                        <span>Reschedule</span>
                      </button>
                    );
                  }

                  if (nextStep === 'confirmed') {
                    return (
                      <button
                        key={nextStep}
                        disabled={updatingStatusId === selectedAppt._id}
                        onClick={() => handleStatusChange(selectedAppt._id, 'confirmed')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: updatingStatusId === selectedAppt._id ? 'wait' : 'pointer',
                          border: 'none',
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                        }}
                        title="Confirm appointment and email patient"
                      >
                        <CheckCircle2 size={15} />
                        <span>Confirm</span>
                      </button>
                    );
                  }

                  if (nextStep === 'completed') {
                    return (
                      <button
                        key={nextStep}
                        disabled={updatingStatusId === selectedAppt._id}
                        onClick={() => handleStatusChange(selectedAppt._id, 'completed')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: updatingStatusId === selectedAppt._id ? 'wait' : 'pointer',
                          border: 'none',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                        }}
                        title="Mark dental treatment complete"
                      >
                        <Check size={15} />
                        <span>Complete Care</span>
                      </button>
                    );
                  }

                  if (nextStep === 'cancelled') {
                    return (
                      <button
                        key={nextStep}
                        disabled={updatingStatusId === selectedAppt._id}
                        onClick={() => openCancelModal(selectedAppt)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: updatingStatusId === selectedAppt._id ? 'wait' : 'pointer',
                          border: 'none',
                          background: '#ef4444',
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                        }}
                        title="Cancel booking with reason (e.g. fee/budget issue)"
                      >
                        <X size={15} />
                        <span>Cancel</span>
                      </button>
                    );
                  }

                  if (nextStep === 'pending') {
                    return (
                      <button
                        key={nextStep}
                        disabled={updatingStatusId === selectedAppt._id}
                        onClick={() => handleStatusChange(selectedAppt._id, 'pending')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: updatingStatusId === selectedAppt._id ? 'wait' : 'pointer',
                          border: 'none',
                          background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
                          color: '#ffffff',
                        }}
                        title="Re-open cancelled booking back to Pending"
                      >
                        <RefreshCw size={14} />
                        <span>Re-open</span>
                      </button>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {/* Dental Concern Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem' }}>
                Dental Concern / Issue Description
              </h3>
              <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '12px', padding: '1rem 1.25rem', color: '#4a044e', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedAppt.message ? selectedAppt.message : <em style={{ color: '#a21caf' }}>No message provided by patient.</em>}
              </div>
            </div>

            {/* Uploaded Photos & Documents Section */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} color="#2563eb" />
                <span>Uploaded Dental Photos & Documents ({parseAttachments(selectedAppt.attachments).length})</span>
              </h3>

              {parseAttachments(selectedAppt.attachments).length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem' }}>
                  Patient did not upload any photos or documents with this request.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {parseAttachments(selectedAppt.attachments).map((att, idx) => {
                    const isImg = isImageFile(att);
                    return (
                      <div
                        key={idx}
                        style={{
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          overflow: 'hidden',
                          background: '#ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {isImg ? (
                          <div
                            style={{
                              position: 'relative',
                              height: '140px',
                              background: '#0f172a',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => setLightboxImg({ url: att.url, name: att.name })}
                            title="Click to view full size image"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 6,
                                right: 6,
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Eye size={10} /> View
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              height: '140px',
                              background: '#f1f5f9',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              color: '#475569',
                            }}
                          >
                            <FileText size={36} color="#64748b" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0 8px', textAlign: 'center', wordBreak: 'break-all' }}>
                              {att.name}
                            </span>
                          </div>
                        )}

                        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={att.name}
                          >
                            {att.name}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                flex: 1,
                                padding: '0.4rem',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                textAlign: 'center',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                            >
                              <ExternalLink size={12} /> Open
                            </a>
                            <a
                              href={att.url}
                              download={att.name}
                              style={{
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Download"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Interactive Modal */}
      {rescheduleModalAppt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '1rem',
          }}
          onClick={() => setRescheduleModalAppt(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', padding: '1.2rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Reschedule Appointment</h3>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Pick new date &amp; time slot for doctor availability</span>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalAppt(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#92400e' }}>
                <div><strong>Patient:</strong> {rescheduleModalAppt.patientName} &bull; {rescheduleModalAppt.phone}</div>
                <div style={{ marginTop: '2px', fontSize: '0.8rem' }}><strong>Currently Booked:</strong> {new Date(rescheduleModalAppt.appointmentDate).toLocaleDateString()} ({rescheduleModalAppt.appointmentTime})</div>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Select New Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Time */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Select New Time Slot <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                >
                  <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                  <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                  <option value="11:30 AM">11:30 AM (Late Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                  <option value="03:30 PM">03:30 PM (Afternoon Slot)</option>
                  <option value="05:00 PM">05:00 PM (Evening Slot)</option>
                  <option value="06:30 PM">06:30 PM (Evening Slot)</option>
                </select>
              </div>

              {/* Note / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Reason (Included in patient email)
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {['Doctor unavailable on requested date', 'Clinic schedule full', 'Patient requested date change'].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setRescheduleNote(quick)}
                      style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '5px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer' }}
                    >
                      {quick}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="e.g. Doctor is unavailable, rescheduled to new slot"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  style={{ padding: '0.55rem 1.15rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingStatusId === rescheduleModalAppt._id}
                  onClick={submitReschedule}
                  style={{ padding: '0.55rem 1.35rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Calendar size={14} />
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Interactive Modal */}
      {cancelModalAppt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '1rem',
          }}
          onClick={() => setCancelModalAppt(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: '#ef4444', padding: '1.2rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Cancel Booking</h3>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Notify patient &amp; record cancellation</span>
                </div>
              </div>
              <button
                onClick={() => setCancelModalAppt(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#991b1b' }}>
                <div><strong>Patient:</strong> {cancelModalAppt.patientName} &bull; {cancelModalAppt.email}</div>
                <div style={{ marginTop: '2px', fontSize: '0.8rem' }}>Current status &ldquo;{STATUS_LABELS[cancelModalAppt.status] || cancelModalAppt.status}&rdquo; will be changed to &ldquo;Cancelled&rdquo;</div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                >
                  <option value="Patient unable to arrange treatment fees / budget">💰 Patient unable to arrange fees / budget (பணம் ரெடி பண்ண முடியவில்லை)</option>
                  <option value="Patient requested cancellation">👤 Patient requested cancellation (நோயாளி வேண்டுகோள்)</option>
                  <option value="Travel or flight tickets delayed / cancelled">✈️ Travel, visa, or flight tickets delayed / cancelled</option>
                  <option value="No response from patient after follow-ups">📵 No response from patient after follow-ups</option>
                  <option value="Doctor or clinic scheduling conflict">⚠️ Doctor or clinic scheduling conflict</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              {/* Additional Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Additional Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={cancelCustomNote}
                  onChange={(e) => setCancelCustomNote(e.target.value)}
                  placeholder="e.g. Patient will contact next month when funds are ready"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#64748b' }}>
                💡 <em>You can re-open this appointment back to &ldquo;Pending&rdquo; anytime if the patient contacts the clinic again.</em>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  style={{ padding: '0.55rem 1.15rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={updatingStatusId === cancelModalAppt._id}
                  onClick={submitCancel}
                  style={{ padding: '0.55rem 1.35rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <X size={14} />
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxImg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem',
          }}
          onClick={() => setLightboxImg(null)}
        >
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={lightboxImg.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ExternalLink size={15} /> Open New Tab
            </a>
            <a
              href={lightboxImg.url}
              download={lightboxImg.name}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: '#24e0e1',
                color: '#160427',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={15} /> Download
            </a>
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={22} />
            </button>
          </div>

          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg.url}
              alt={lightboxImg.name}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
            />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>
            {lightboxImg.name}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAppointments;
