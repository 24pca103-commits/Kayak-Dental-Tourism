import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Stethoscope, Star, HelpCircle, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Appointments', path: '/admin/appointments', icon: <Calendar size={18} /> },
  { label: 'Doctors', path: '/admin/doctors', icon: <Users size={18} /> },
  { label: 'Services', path: '/admin/services', icon: <Stethoscope size={18} /> },
  { label: 'Testimonials', path: '/admin/testimonials', icon: <Star size={18} /> },
  { label: 'FAQs', path: '/admin/faqs', icon: <HelpCircle size={18} /> },
];

interface Props { children: React.ReactNode }

const AdminLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('kayal_admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('kayal_admin_token');
    localStorage.removeItem('kayal_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__logo">
          <img src="/assets/kayal-brand-logo.png" alt="KAYAL Admin" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${location.pathname === item.path ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {location.pathname === item.path && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{(user.name || 'A').charAt(0)}</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{user.name || 'Admin'}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{user.role || 'admin'}</div>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textDecoration: 'none' }} target="_blank">
              View Website ↗
            </Link>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>
              {(user.name || 'A').charAt(0)}
            </div>
          </div>
        </header>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
