import React, { useState, useEffect } from 'react';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';

const AppointmentPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    document.title = 'Book Appointment | KAYAL Dental Care';
    Promise.all([servicesAPI.getAll(), doctorsAPI.getAll()])
      .then(([s, d]) => { setServices(s.data?.data || []); setDoctors(d.data?.data || []); })
      .catch(() => {});
    // Automatically show the modal
    setShowModal(true);
  }, []);

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <section style={{ background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h1 className="section-title text-white">Book Your Appointment</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem' }}>Fill in the form below and our team will confirm your appointment shortly.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,var(--purple-600),var(--purple-700))', padding: '1.5rem 2rem' }}>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>Appointment Request Form</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Select your service, preferred doctor, date and time</p>
            </div>
            <div style={{ padding: '2rem' }}>
              <button className="btn btn-purple btn-lg w-full" onClick={() => setShowModal(true)}>
                Open Appointment Form
              </button>
            </div>
          </div>
        </div>
      </section>
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} services={services} doctors={doctors} />}
    </div>
  );
};

export default AppointmentPage;
