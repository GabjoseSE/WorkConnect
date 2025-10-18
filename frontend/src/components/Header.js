import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.svg';
import { useAuth } from '../contexts/AuthContext';
import SignupContext from '../contexts/SignupContext';

export default function Header() {
  const location = useLocation();
  const hideNav = /^\/login|^\/signup|^\/choose-role|^\/employer-signup/.test(location.pathname);
  const isJobhunterDashboard = /^\/jobhunter/.test(location.pathname);

  const { token, logout, profile } = useAuth();
  const navigate = useNavigate();
  const loggedInHome = profile && profile.role === 'employer' ? '/employer/dashboard' : '/jobhunter/dashboard';

  const displayName = profile
    ? (
        profile.firstName ||
        profile.name ||
        (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : null) ||
        profile.companyName ||
        profile.email
      )
    : null;

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const isEmployerDashboard = /^\/employer(\/|$)/.test(location.pathname);
  if (token && (isJobhunterDashboard || isEmployerDashboard)) return null;

  return (
    <header className={`wc-header ${hideNav ? 'wc-header--compact' : ''}`}>
      <div className="wc-header-inner">
        <div className="wc-left">
          <LogoLink />
        </div>

        {!hideNav && (
          <nav className="wc-center">
            {isJobhunterDashboard ? (
              <>
                <Link to="/jobhunter/dashboard">Home</Link>
                <Link to="/jobhunter/jobs">Jobs</Link>
                <Link to="/jobhunter/profile">Profile</Link>
              </>
            ) : (
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

        {/* Login/Signup buttons removed */}
      </div>
    </header>
  );
}

function LogoLink() {
  const location = useLocation();
  const signupCtx = useContext(SignupContext);

  return (
    <Link
      to="/"
      className="wc-logo"
      onClick={() => {
        if (/^\/signup|^\/choose-role|^\/employer-signup/.test(location.pathname)) {
          try {
            signupCtx && signupCtx.reset && signupCtx.reset();
          } catch (err) {
            // no-op
          }
        }
      }}
    >
      <img src={logo} alt="WorkConnect" className="wc-logo-img" />
      <span className="wc-logo-fallback"></span>
    </Link>
  );
}
