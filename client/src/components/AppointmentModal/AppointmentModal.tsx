import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';
import { appointmentsAPI } from '../../services/api';
import { sendRealtimeEmail } from '../../services/emailService';
import {
  COUNTRY_PHONE_LIST,
  getCountryConfig,
  validatePhoneNumber,
  validateEmail,
  validateFullName,
} from '../../utils/phoneValidation';
import type { Service, Doctor } from '../../types';
import '../../styles/AppointmentModal.css';

interface Props {
  onClose: () => void;
  services: Service[];
  doctors: Doctor[];
  preselectedService?: string;
  preselectedDoctor?: string;
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

const AppointmentModal: React.FC<Props> = ({ onClose, services, doctors, preselectedService, preselectedDoctor }) => {
  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    serviceName: preselectedService || '',
    doctorName: preselectedDoctor || '',
    appointmentDate: '',
    appointmentTime: '',
    message: '',
  });
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const countryConfig = getCountryConfig(selectedCountry);
  const maxPhoneDigits = Math.max(...(countryConfig.digitLengths || [10]));
  const serviceList = services.length > 0 ? services.map(s => s.name) : SERVICE_OPTIONS;
  const selectedDoctorObj = doctors.find(d => d.name === form.doctorName);

  // Helper to extract doctor available days in lowercase short form ['mon', 'tue', ...]
  const getDoctorAvailableDays = (doc?: Doctor): string[] => {
    if (!doc) return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    let avail = doc.availability;
    if (typeof avail === 'string') {
      try {
        avail = JSON.parse(avail);
      } catch {
        avail = [];
      }
    }
    if (!Array.isArray(avail) || avail.length === 0) {
      return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    }
    return avail.map(d => d.slice(0, 3).toLowerCase());
  };

  // Helper to check if a doctor is available on a specific YYYY-MM-DD date
  const checkDoctorAvailability = (dateStr: string, doc?: Doctor) => {
    if (!dateStr) return { available: true, dayName: '', availableDisplay: '' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { available: true, dayName: '', availableDisplay: '' };
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayShorts = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayIdx = dateObj.getDay();
    const dayName = dayNames[dayIdx];
    const dayShort = dayShorts[dayIdx];

    if (!doc) return { available: true, dayName, availableDisplay: 'All Days' };
    const availableDays = getDoctorAvailableDays(doc);
    const isAvail = availableDays.includes(dayShort);
    const dayCapitalized = doc.availability && Array.isArray(doc.availability) ? doc.availability.join(', ') : 'Mon - Sun';
    return { available: isAvail, dayName, availableDisplay: dayCapitalized };
  };

  // Query booked time slots whenever the appointment date changes
  React.useEffect(() => {
    if (!form.appointmentDate) {
      setBookedTimes([]);
      return;
    }

    let isMounted = true;

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
      }
    };

    loadBookedSlots();
    return () => { isMounted = false; };
  }, [form.appointmentDate]);

  // Only display time slots that are NOT booked
  const availableTimeSlots = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot));

  const validateAll = () => {
    const e: Record<string, string> = {};
    const nameRes = validateFullName(form.patientName);
    if (!nameRes.isValid && nameRes.error) e.patientName = nameRes.error;

    const phoneRes = validatePhoneNumber(form.phone, selectedCountry);
    if (!phoneRes.isValid && phoneRes.error) e.phone = phoneRes.error;

    const emailRes = validateEmail(form.email);
    if (!emailRes.isValid && emailRes.error) e.email = emailRes.error;

    if (!form.serviceName) e.serviceName = 'Please select a service';
    if (!form.appointmentDate) {
      e.appointmentDate = 'Please select a date';
    } else if (selectedDoctorObj) {
      const check = checkDoctorAvailability(form.appointmentDate, selectedDoctorObj);
      if (!check.available) {
        e.appointmentDate = `${selectedDoctorObj.name} is not available on ${check.dayName}. Available days: ${check.availableDisplay}`;
      }
    }
    if (!form.appointmentTime) e.appointmentTime = 'Please select a time slot';
    return e;
  };

  const validateSingleField = (name: string, value: string, country = selectedCountry) => {
    switch (name) {
      case 'patientName':
        return validateFullName(value).error || '';
      case 'phone':
        return validatePhoneNumber(value, country).error || '';
      case 'email':
        return validateEmail(value).error || '';
      case 'serviceName':
        return !value ? 'Please select a service' : '';
      case 'appointmentDate': {
        if (!value) return 'Please select a date';
        if (selectedDoctorObj) {
          const check = checkDoctorAvailability(value, selectedDoctorObj);
          if (!check.available) {
            return `${selectedDoctorObj.name} is not available on ${check.dayName}. Available days: ${check.availableDisplay}`;
          }
        }
        return '';
      }
      case 'appointmentTime':
        return !value ? 'Please select a time slot' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Strict digit restriction for phone field
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, maxPhoneDigits);
      setForm(prev => ({ ...prev, phone: digitsOnly }));
      if (touched.phone || errors.phone) {
        const err = validateSingleField('phone', digitsOnly, selectedCountry);
        setErrors(prev => ({ ...prev, phone: err }));
      }
      return;
    }

    // When doctor changes, re-validate date for the newly selected doctor
    if (name === 'doctorName') {
      const newDoc = doctors.find(d => d.name === value);
      setForm(prev => ({ ...prev, doctorName: value }));
      if (form.appointmentDate) {
        const check = checkDoctorAvailability(form.appointmentDate, newDoc);
        if (!check.available) {
          setErrors(prev => ({
            ...prev,
            appointmentDate: `${newDoc?.name || 'Doctor'} is not available on ${check.dayName}. Available days: ${check.availableDisplay}`,
          }));
        } else {
          setErrors(prev => {
            const next = { ...prev };
            delete next.appointmentDate;
            return next;
          });
        }
      }
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name] || errors[name]) {
      const err = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateSingleField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const newConfig = getCountryConfig(newCountry);
    const newMaxDigits = Math.max(...(newConfig.digitLengths || [10]));
    const truncatedPhone = form.phone.slice(0, newMaxDigits);
    setForm(prev => ({ ...prev, phone: truncatedPhone }));
    if (truncatedPhone.trim()) {
      const err = validateSingleField('phone', truncatedPhone, newCountry);
      setErrors(prev => ({ ...prev, phone: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      patientName: true,
      phone: true,
      email: true,
      serviceName: true,
      appointmentDate: true,
      appointmentTime: true,
    });
    const errs = validateAll();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const phoneResult = validatePhoneNumber(form.phone, selectedCountry);
    const fullPhone = phoneResult.formatted || `${countryConfig.code} ${form.phone.trim()}`;

    try {
      // 1. Save directly to appointments API in MySQL
      try {
        await appointmentsAPI.create({
          ...form,
          phone: fullPhone,
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
        console.warn('API create warning (will use local fallback):', err);
      }

      // 2. Cache booked slot in localStorage for instant local reflect and backup
      try {
        const localBookings = JSON.parse(localStorage.getItem('kayal_booked_appointments') || '[]');
        localBookings.push({ date: form.appointmentDate, time: form.appointmentTime, service: form.serviceName });
        localStorage.setItem('kayal_booked_appointments', JSON.stringify(localBookings));

        const fullBookings = JSON.parse(localStorage.getItem('kayal_local_appointments') || '[]');
        fullBookings.unshift({
          _id: 'bk_' + Date.now(),
          patientName: form.patientName,
          phone: fullPhone,
          email: form.email,
          serviceName: form.serviceName,
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          message: form.message,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('kayal_local_appointments', JSON.stringify(fullBookings));
        window.dispatchEvent(new Event('storage'));
      } catch {
        // ignore
      }

      // 3. Broadcast instant sync to all open admin tabs/windows
      try {
        const bc = new BroadcastChannel('kayal_live_sync');
        bc.postMessage({ type: 'NEW_APPOINTMENT', patientName: form.patientName, timestamp: Date.now() });
        bc.close();
      } catch {}

      // 4. Send real-time confirmation email to user in background (non-blocking)
      sendRealtimeEmail({
        name: form.patientName,
        email: form.email,
        phone: fullPhone,
        subject: `Appointment Booking - ${form.serviceName}`,
        message: `Appointment for ${form.serviceName} on ${form.appointmentDate} at ${form.appointmentTime}. ${form.message || ''}`,
      }).catch((emailErr) => console.warn('Email notification error:', emailErr));

      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
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
          <form className="appointment-modal__form" onSubmit={handleSubmit} noValidate>
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
                  onBlur={handleBlur}
                  maxLength={60}
                  required
                />
                {errors.patientName && <span className="form-error">{errors.patientName}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} /> Phone Number *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="form-input"
                    style={{ width: '140px', flexShrink: 0, padding: '0 6px', fontSize: '0.85rem', cursor: 'pointer', background: 'white' }}
                    aria-label="Country Code"
                  >
                    {COUNTRY_PHONE_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                   <input
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    type="tel"
                    name="phone"
                    placeholder={countryConfig.placeholder}
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={maxPhoneDigits}
                    required
                    style={{ flex: 1, minWidth: 0 }}
                  />
                </div>
                {errors.phone && <span className="form-error" style={{ marginTop: '0.2rem', display: 'block' }}>{errors.phone}</span>}
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
                  onBlur={handleBlur}
                  required
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
                  required
                >
                  <option value="">Choose a service</option>
                  {serviceList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.serviceName && <span className="form-error">{errors.serviceName}</span>}
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
                  required
                />
                {errors.appointmentDate && <span className="form-error">{errors.appointmentDate}</span>}
              </div>

              {/* Time List Box */}
              <div className="form-group">
                <label className="form-label" htmlFor="appointmentTimeSelect">
                  <Clock size={14} /> Preferred Time *
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
              style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ffffff' }}
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  Book Appointment <ArrowRight size={18} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor' }} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
