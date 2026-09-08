import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, ChevronDown, CheckCircle } from 'lucide-react';
import { appointmentsAPI } from '../../services/api';
import { sendRealtimeEmail } from '../../services/emailService';
import type { Service, Doctor } from '../../types';
import './AppointmentModal.css';

interface Props {
  onClose: () => void;
  services: Service[];
  doctors: Doctor[];
  preselectedService?: string;
}

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
];

const SERVICE_OPTIONS = [
  'Dental Implants', 'Teeth Alignment', 'Teeth Replacement', 'Smile Designing',
  'Root Canal Treatment', 'Teeth Whitening', 'Braces', 'Clear Aligners',
  'General Dental Check-up', 'Pediatric Dentistry', 'Emergency Dental Care',
];

const AppointmentModal: React.FC<Props> = ({ onClose, services, doctors, preselectedService }) => {
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    serviceName: preselectedService || '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const serviceList = services.length > 0 ? services.map(s => s.name) : SERVICE_OPTIONS;
  const doctorList = doctors.length > 0 ? doctors.map(d => d.name) : ['Any Available Doctor'];

  // Query booked time slots whenever the appointment date changes
  React.useEffect(() => {
    if (!form.appointmentDate) {
      setBookedTimes([]);
      return;
    }

    let isMounted = true;
    setFetchingSlots(true);

    const loadBookedSlots = async () => {
      const bookedSet = new Set<string>();

      // 1. Check local storage bookings cache
      try {
        const localBookings = JSON.parse(localStorage.getItem('kayal_booked_appointments') || '[]');
        localBookings.forEach((b: any) => {
          if (b.date === form.appointmentDate && b.time) {
            bookedSet.add(b.time);
          }
        });
      } catch {
        // ignore
      }

      // 2. Query backend API
      try {
        const res = await appointmentsAPI.getBookedSlots(form.appointmentDate);
        if (res.data?.bookedTimes && Array.isArray(res.data.bookedTimes)) {
          res.data.bookedTimes.forEach((t: string) => bookedSet.add(t));
        }
      } catch {
        // backend offline or empty
      }

      if (isMounted) {
        const bookedArray = Array.from(bookedSet);
        setBookedTimes(bookedArray);
        // If current selected time is already booked, reset it
        if (form.appointmentTime && bookedSet.has(form.appointmentTime)) {
          setForm(prev => ({ ...prev, appointmentTime: '' }));
        }
        setFetchingSlots(false);
      }
    };

    loadBookedSlots();
    return () => { isMounted = false; };
  }, [form.appointmentDate]);

  // Only display time slots that are NOT booked
  const availableTimeSlots = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patientName.trim()) e.patientName = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.serviceName) e.serviceName = 'Please select a service';
    if (!form.appointmentDate) e.appointmentDate = 'Please select a date';
    if (!form.appointmentTime) e.appointmentTime = 'Please select a time';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      // 1. Send real-time confirmation email to user
      await sendRealtimeEmail({
        name: form.patientName,
        email: form.email,
        phone: form.phone,
        subject: `Appointment Booking - ${form.serviceName}`,
        message: `Appointment for ${form.serviceName} on ${form.appointmentDate} at ${form.appointmentTime}. ${form.message || ''}`,
      });

      // 2. Save to appointments API in MongoDB
      try {
        await appointmentsAPI.create({
          ...form,
          appointmentDate: new Date(form.appointmentDate).toISOString(),
        });
      } catch (err: any) {
        if (err?.response?.status === 409) {
          const conflictMsg = err.response.data?.message || 'This time slot is already booked. Please choose another slot.';
          setErrors(prev => ({ ...prev, appointmentTime: conflictMsg }));
          // Refresh booked slots immediately
          try {
            const res = await appointmentsAPI.getBookedSlots(form.appointmentDate);
            if (res.data?.bookedTimes && Array.isArray(res.data.bookedTimes)) {
              setBookedTimes(res.data.bookedTimes);
            }
          } catch {
            // ignore
          }
          setLoading(false);
          return;
        }
      }

      // 3. Cache booked slot in localStorage for instant local reflect
      try {
        const localBookings = JSON.parse(localStorage.getItem('kayal_booked_appointments') || '[]');
        localBookings.push({ date: form.appointmentDate, time: form.appointmentTime, service: form.serviceName });
        localStorage.setItem('kayal_booked_appointments', JSON.stringify(localBookings));
      } catch {
        // ignore
      }

      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="appointment-modal">
        <div className="appointment-modal__header">
          <div>
            <h2 className="appointment-modal__title">Book an Appointment</h2>
            <p className="appointment-modal__subtitle">Fill in your details and we'll confirm your slot</p>
          </div>
          <button className="appointment-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="appointment-modal__success">
            <div className="appointment-modal__success-icon">
              <CheckCircle size={48} />
            </div>
            <h3>Appointment Request Submitted!</h3>
            <p>
              Your appointment request has been submitted successfully. Our clinic team will contact you shortly to confirm your appointment.
            </p>
            <button className="btn btn-purple" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="appointment-modal__form" onSubmit={handleSubmit}>
            <div className="appt-form__grid">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> Patient Name *
                </label>
                <input
                  className={`form-input ${errors.patientName ? 'error' : ''}`}
                  type="text"
                  name="patientName"
                  placeholder="Your full name"
                  value={form.patientName}
                  onChange={handleChange}
                />
                {errors.patientName && <span className="form-error">{errors.patientName}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} /> Phone Number *
                </label>
                <input
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} /> Email Address *
                </label>
                <input
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Service */}
              <div className="form-group">
                <label className="form-label">
                  <ChevronDown size={14} /> Select Service *
                </label>
                <select
                  className={`form-input ${errors.serviceName ? 'error' : ''}`}
                  name="serviceName"
                  value={form.serviceName}
                  onChange={handleChange}
                >
                  <option value="">Choose a service</option>
                  {serviceList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.serviceName && <span className="form-error">{errors.serviceName}</span>}
              </div>

              {/* Doctor */}
              <div className="form-group">
                <label className="form-label">Preferred Doctor</label>
                <select
                  className="form-input"
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleChange}
                >
                  <option value="">Any Available Doctor</option>
                  {doctorList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Preferred Date *
                </label>
                <input
                  className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
                  type="date"
                  name="appointmentDate"
                  min={minDateStr}
                  value={form.appointmentDate}
                  onChange={handleChange}
                />
                {errors.appointmentDate && <span className="form-error">{errors.appointmentDate}</span>}
              </div>

              {/* Time List Box */}
              <div className="form-group appt-form__time-group">
                <label className="form-label" htmlFor="appointmentTimeSelect">
                  <Clock size={14} /> Preferred Time (Available Slots) *
                  {form.appointmentDate && (
                    <span style={{ fontSize: '0.78rem', color: '#0284c7', marginLeft: 'auto', fontWeight: 600 }}>
                      {fetchingSlots ? 'Checking slots...' : `${availableTimeSlots.length} available`}
                    </span>
                  )}
                </label>

                {!form.appointmentDate ? (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--gray-50)',
                    border: '1.5px dashed var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--gray-500)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Calendar size={14} /> Please select a date first to view available timings
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: 'var(--radius-md)',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}>
                    ⚠️ All time slots for this date are already booked. Please choose another date.
                  </div>
                ) : (
                  <select
                    id="appointmentTimeSelect"
                    className={`form-input ${errors.appointmentTime ? 'error' : ''}`}
                    name="appointmentTime"
                    value={form.appointmentTime}
                    onChange={handleChange}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: form.appointmentTime ? '#451271' : 'var(--gray-600)',
                      background: 'white',
                    }}
                  >
                    <option value="">-- Select Preferred Time Slot --</option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot} (Available)
                      </option>
                    ))}
                  </select>
                )}
                {errors.appointmentTime && <span className="form-error">{errors.appointmentTime}</span>}
              </div>

              {/* Message */}
              <div className="form-group appt-form__full">
                <label className="form-label">Additional Information</label>
                <textarea
                  className="form-input"
                  name="message"
                  rows={3}
                  placeholder="Any specific concerns or information..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-purple btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Submitting...' : 'Book Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
