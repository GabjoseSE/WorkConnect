import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/signup/signup.css';
import './jobhunter.css';
import logo from '../../assets/logo.svg';

export default function DashboardLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout failed', e);
    }
    navigate('/login');
  };

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('sidebar-open');
    else document.body.classList.remove('sidebar-open');
  }, [mobileOpen]);

  return (
    <div className="dashboard-root">
      {/* overlay shown only on mobile when sidebar is open */}
      {mobileOpen && <div className="dashboard-overlay show" onClick={() => setMobileOpen(false)} aria-hidden />}

  <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={{ position: 'relative' }}>
        <button
          className="sidebar-toggle"
          onClick={() => {
            // On narrow screens toggle mobile open; otherwise collapse
            if (window.innerWidth <= 900) setMobileOpen(o => !o);
            else setCollapsed(s => !s);
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={mobileOpen}
        >
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M9 6L15 12L9 18" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 6L9 12L15 18" stroke="#233038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="sidebar-header" style={{ marginBottom: 18 }}>
          <img src={logo} className="wc-sidebar-logo" alt="WorkConnect" />
          <div style={{ display: 'inline-block', marginLeft: 8 }}>
            <h2 className="sidebar-title">WorkConnect</h2>
            <div className="sidebar-role" style={{ marginTop: 6, color: '#6b7280' }}>Jobseeker</div>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            <li>
              <Link to="/jobhunter/dashboard" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z" fill="#233038"/></svg>
                </span>
                <span className="label">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/profile" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3 0-9 1.5-9 4.4V22h18v-3.4c0-2.9-6-4.4-9-4.4z" fill="#233038"/></svg>
                </span>
                <span className="label">Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/jobs" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v2H4zM4 11h10v2H4zM4 16h16v2H4z" fill="#233038"/></svg>
                </span>
                <span className="label">Job Listings</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/saved-jobs" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h12v20l-6-3-6 3V2z" fill="#233038"/></svg>
                </span>
                <span className="label">Saved Jobs</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/applications" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.1 0-2 .9-2 2v14l4-2 4 2 4-2 4 2V5c0-1.1-.9-2-2-2z" fill="#233038"/></svg>
                </span>
                <span className="label">Applications</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/notifications" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2zm6-6V11c0-3.1-1.6-5.6-4.5-6.3V4a1.5 1.5 0 0 0-3 0v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1l-2-2z" fill="#233038"/></svg>
                </span>
                <span className="label">Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/messages" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v14l4-2 4 2 8-4V4c0-1.1-.9-2-2-2z" fill="#233038"/></svg>
                </span>
                <span className="label">Messages</span>
              </Link>
            </li>
            <li>
              <Link to="/jobhunter/settings" className="sidebar-link">
                <span className="icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.4 12.9c.04-.3.06-.6.06-.9s-.02-.6-.06-.9l2.1-1.6c.2-.15.3-.4.2-.65l-2-3.46c-.1-.25-.35-.36-.6-.28l-2.5 1c-.5-.4-1-.7-1.6-.9l-.4-2.65A.5.5 0 0 0 13 2h-4c-.25 0-.46.18-.5.43L7.1 5.1c-.6.2-1.1.5-1.6.9l-2.5-1c-.25-.1-.5.03-.6.28L.9 9.7c-.1.25 0 .5.2.65L3.2 12c-.05.3-.1.6-.1.9s.05.6.1.9L.9 15.4c-.2.15-.3.4-.2.65l2 3.46c.1.25.35.36.6.28l2.5-1c.5.4 1 .7 1.6.9l.4 2.65c.04.25.25.43.5.43h4c.25 0 .46-.18.5-.43l.4-2.65c.6-.2 1.1-.5 1.6-.9l2.5 1c.25.1.5-.03.6-.28l2-3.46c.1-.25 0-.5-.2-.65L19.4 12.9zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" fill="#233038"/></svg>
                </span>
                <span className="label">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ position: 'absolute', bottom: 18, left: 12, right: 12 }}>
          <button className="secondary-btn logout-btn" onClick={doLogout} style={{ width: '100%' }}>
            <span className="logout-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#233038"/></svg>
            </span>
            <span className="logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
