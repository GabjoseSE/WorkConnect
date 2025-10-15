import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function JobhunterDashboard() {
  const { profile } = useAuth();
  return (
    <div>


      <main className="page-content">
        <div style={{ padding: 24 }}>
          <h1>Jobseeker Dashboard</h1>
          <p>Welcome{profile?.firstName ? `, ${profile.firstName}` : ''} — here are your recommended jobs.</p>
          {/* Placeholder content */}
          <div style={{ marginTop: 18 }}>
            <p><strong>Recommended Jobs</strong></p>
            <ul>
              <li>Frontend Developer — Remote — Acme</li>
              <li>Full-stack Engineer — New York — BetaCorp</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
