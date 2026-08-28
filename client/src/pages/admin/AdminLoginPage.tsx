import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authAPI } from '../../services/api';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form.email, form.password);
      localStorage.setItem('kayal_admin_token', res.data.token);
      localStorage.setItem('kayal_admin_user', JSON.stringify(res.data.user));
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,var(--purple-900),var(--purple-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '3rem 2.5rem', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/assets/kayal-brand-logo.png" alt="KAYAL Multispeciality Dental Care" style={{ height: '70px', width: 'auto', objectFit: 'contain', margin: '0 auto 1rem' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple-700)' }}>Admin Portal</h1>
          </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#991b1b', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label"><Mail size={13} style={{ display: 'inline', marginRight: 4 }} />Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@kayaldental.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={13} style={{ display: 'inline', marginRight: 4 }} />Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ paddingRight: '2.5rem' }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-purple btn-lg w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--gray-500)', textAlign: 'center' }}>
          <strong>Demo Credentials</strong><br />
          Email: admin@kayaldental.com<br />
          Password: Admin@1234
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
