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

  // When the user is authenticated, hide the global header only on dashboard routes
  const isEmployerDashboard = /^\/employer/.test(location.pathname);
  if (token && (isJobhunterDashboard || isEmployerDashboard)) return null;

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
                <Link to="/jobhunter/jobs">Jobs</Link>
                <Link to="/jobhunter/profile">Profile</Link>
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
