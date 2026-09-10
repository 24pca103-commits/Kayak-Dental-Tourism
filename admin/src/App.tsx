import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminAppointments from './pages/AdminAppointments';
import AdminDashboard from './pages/AdminDashboard';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('kayal_admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/appointments" element={<RequireAuth><AdminAppointments /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
