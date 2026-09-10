import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      try {
        const res = await authAPI.login(cleanEmail, cleanPassword);
        if (res.data.success && res.data.token) {
          localStorage.setItem('kayal_admin_token', res.data.token);
          localStorage.setItem('kayal_admin_user', JSON.stringify(res.data.user));
          navigate('/dashboard');
          return;
        }
      } catch (apiErr: unknown) {
        // Fallback for offline or default credentials
        if (cleanEmail === 'admin@kayaldental.com' && cleanPassword === 'Admin@1234') {
          const adminUser = {
            id: '1',
            email: 'admin@kayaldental.com',
            name: 'Super Admin',
            role: 'admin',
          };
          localStorage.setItem('kayal_admin_token', 'local_jwt_admin_token_active');
          localStorage.setItem('kayal_admin_user', JSON.stringify(adminUser));
          navigate('/dashboard');
          return;
        }
        throw apiErr;
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid email or password. Please use admin@kayaldental.com / Admin@1234');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #160427 0%, #240840 50%, #351060 100%)',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(36,224,225,0.15) 0%, transparent 70%)',
        top: '10%',
        right: '15%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'linear-gradient(180deg, #240840 0%, #1a062e 100%)',
        borderRadius: '22px',
        padding: '2rem 1.6rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(36,224,225,0.2)',
        border: '1.5px solid rgba(36,224,225,0.45)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/assets/kayal-brand-logo.png"
            alt="KAYAL Dental Tourism"
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '1rem',
              display: 'inline-block',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))'
            }}
          />

          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.02em',
            fontFamily: 'Comfortaa, cursive, sans-serif'
          }}>
            Admin Portal
          </h1>
          <p style={{
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '0.35rem'
          }}>
            Manage Bookings & Appointments
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.4rem' }}>
              Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, color: '#24E0E1', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kayaldental.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(36,224,225,0.3)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, color: '#24E0E1', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(36,224,225,0.3)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'transparent',
                  border: 'none',
                  color: showPassword ? '#24E0E1' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #24E0E1 0%, #18b8b9 100%)',
              border: 'none',
              color: '#350d58',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(36,224,225,0.4)',
              transition: 'all 0.2s ease',
              fontFamily: 'Comfortaa, cursive, sans-serif'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In '}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.4rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            Default credentials:<br />
            <strong style={{ color: '#24E0E1' }}>admin@kayaldental.com</strong> &bull; <strong style={{ color: '#24E0E1' }}>Admin@1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
