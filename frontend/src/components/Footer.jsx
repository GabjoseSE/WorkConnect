import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="wc-footer">
      <div className="wc-footer-inner">
        <div className="wc-footer-left">
          <div className="wc-logo">WorkConnect</div>
          <div className="wc-copy">© {new Date().getFullYear()} WorkConnect — Connecting talent and opportunity.</div>
        </div>

        <div className="wc-footer-right">
          <a href="/terms" className="wc-footer-link">Terms</a>
          <a href="/privacy" className="wc-footer-link">Privacy</a>
          <a href="/help" className="wc-footer-link">Help</a>
        </div>
      </div>
    </footer>
  );
}
