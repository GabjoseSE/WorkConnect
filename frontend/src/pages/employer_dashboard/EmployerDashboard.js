import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployerDashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Employer Dashboard</h1>
      <p>Welcome{profile?.companyName ? `, ${profile.companyName}` : ''} — manage your jobs and candidates here.</p>
      <div style={{ marginTop: 18 }}>
        <p><strong>Your Active Jobs</strong></p>
        <ul>
          <li>Senior Backend Engineer — 12 applicants</li>
          <li>Product Designer — 5 applicants</li>
        </ul>
      </div>
    </div>
  );
}
