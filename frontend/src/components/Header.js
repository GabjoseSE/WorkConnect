import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.svg';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  // compact header for login/signup flows where only logo should remain visible
  // hide nav on login, any signup flows (jobhunter or employer), and choose-role
  const hideNav = /^\/login|^\/signup|^\/choose-role|^\/employer-signup/.test(location.pathname);
  // dashboard-specific nav when viewing jobhunter dashboard
  const isJobhunterDashboard = /^\/jobhunter/.test(location.pathname);

  const { token, logout, profile } = useAuth();
  const navigate = useNavigate();
  // determine where the logo should link to when logged in
  const loggedInHome = profile && profile.role === 'employer' ? '/employer/dashboard' : '/jobhunter/dashboard';

  // compute a display name from profile fields
  const displayName = profile ? (profile.firstName || profile.name || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : null) || profile.companyName || profile.email) : null;

  // Hooks must be declared unconditionally
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (token) {

    return (
      <header className={"wc-header"}>
        <div className="wc-header-inner">
          <div className="wc-left">
            <Link to={loggedInHome} className="wc-logo">
              <img src={logo} alt="WorkConnect" className="wc-logo-img" />
              <span className="wc-logo-fallback"></span>
            </Link>
          </div>
          <nav className="wc-center">
            <Link to="/jobhunter/dashboard">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/profile">Profile</Link>
          </nav>

          <div className="wc-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }} ref={menuRef}>
            {/* notification bell */}
            <button
              aria-label="notifications"
              onClick={(e) => { e.stopPropagation(); /* placeholder: open notifications panel */ }}
              className="wc-notif"
            >
              {/* simple bell svg */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 17H9a3 3 0 0 1-3-3V11a6 6 0 0 1 12 0v3a3 3 0 0 1-3 3z" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {profile && profile.unreadNotifications > 0 && (
                <span className="wc-notif-badge">{profile.unreadNotifications > 99 ? '99+' : profile.unreadNotifications}</span>
              )}
            </button>

            <button
              aria-label="profile"
              onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              {/* profile avatar (fallback to profile.photo or site logo) */}
              <img
                src={(profile && (profile.avatar || profile.photo)) || logo}
                alt={displayName ? `${displayName} avatar` : 'Profile'}
                className="wc-avatar"
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1px solid rgba(0,0,0,0.06)' }}
              />
            </button>

            {open && (
              <div className="wc-dropdown" role="menu" aria-label="Account menu">
                <div className="wc-dropdown-top">
                  <img src={(profile && (profile.avatar || profile.photo)) || logo} alt="avatar" className="wc-avatar-lg" />
                  <div className="wc-dropdown-top-meta">
                    <div className="wc-dropdown-name">{displayName || 'Profile'}</div>
                    {profile && profile.role && <div className="wc-role-pill">{profile.role === 'employer' ? 'Owner' : profile.role}</div>}
                  </div>
                </div>

                <div className="wc-dropdown-sep" />

                <button className="wc-dropdown-row" onClick={() => { navigate('/profile'); setOpen(false); }}>
                  <span>My Account</span>
                </button>

                <button className="wc-dropdown-row" onClick={() => { logout(); navigate('/'); }}>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`wc-header ${hideNav ? 'wc-header--compact' : ''}`}>
      <div className="wc-header-inner">
        <div className="wc-left">
          <Link to="/" className="wc-logo">
            <img src={logo} alt="WorkConnect" className="wc-logo-img" />
            <span className="wc-logo-fallback"></span>
          </Link>
        </div>

        {!hideNav && (
          <nav className="wc-center">
            {isJobhunterDashboard ? (
              // compact dashboard nav
              <>
                <Link to="/jobhunter/dashboard">Home</Link>
                <Link to="/jobs">Jobs</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              // default site nav
              <>
                <Link to="/">Home</Link>
                <Link to="/jobs">Jobs</Link>
                <Link to="/employers">Employers</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
              </>
            )}
          </nav>
        )}

        {!hideNav && (
          <div className="wc-right">
            <Link to="/login"><button className="wc-btn wc-btn-outline">Login</button></Link>
            <Link to="/choose-role"><button className="wc-btn wc-btn-primary">Sign Up</button></Link>
          </div>
        )}
      </div>
    </header>
  );
}
