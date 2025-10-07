import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.svg';

export default function Header() {
  const location = useLocation();
  // compact header for login/signup flows where only logo should remain visible
  const hideNav = /^\/login|^\/signup|^\/choose-role/.test(location.pathname);

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
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/employers">Employers</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
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
