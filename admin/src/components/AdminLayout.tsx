import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, MessageSquare, LogOut, Menu, X, ChevronRight, Globe } from 'lucide-react';
import '../styles/Admin.css';

const NAV_ITEMS = [
  { label: 'Dashboard Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Bookings & Appointments', path: '/appointments', icon: <Calendar size={18} /> },
  { label: 'Patient Feedback', path: '/feedback', icon: <MessageSquare size={18} /> },
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
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Slide-in Drawer Sidebar (Hidden by default) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__logo">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
            <img src="/assets/kayal-brand-logo.png" alt="KAYAL Admin" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <button
            className="admin-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            title="Close Sidebar Menu"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
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
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Overlay backdrop when sidebar is open */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Full-width Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              className="admin-header__menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Close Menu" : "Open Menu"}
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/assets/kayal-brand-logo.png" alt="Kayal Dental" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={handleLogout}
                className="admin-header__logout-btn"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="admin-header__logout-text">Logout</span>
              </button>
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
