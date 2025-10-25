import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingJobs: 0,
    flaggedReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch admin stats:', err);
        setError('Unable to load stats. Please try again later.');
        setLoading(false);
      });
  }, []);

  const container = {
    padding: '32px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const heading = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
  };

  const subheading = {
    fontSize: '16px',
    color: '#555',
  };

  const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  };

  const card = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '160px',
  };

  const title = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#222',
  };

  const stat = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
  };

  return (
    <div style={container}>
      <div>
        <h1 style={heading}>Admin Dashboard</h1>
        <p style={subheading}>
          Welcome{profile?.fullName ? `, ${profile.fullName}` : ''} — monitor platform activity and manage content.
        </p>
      </div>

      {loading ? (
        <p style={subheading}>Loading stats...</p>
      ) : error ? (
        <p style={{ ...subheading, color: 'red' }}>{error}</p>
      ) : (
        <div style={grid}>
          <div style={card}>
            <p style={title}>Total Users</p>
            <p style={stat}>{stats.totalUsers}</p>
          </div>
          <div style={card}>
            <p style={title}>Pending Job Posts</p>
            <p style={stat}>{stats.pendingJobs}</p>
          </div>
          <div style={card}>
            <p style={title}>Flagged Reports</p>
            <p style={stat}>{stats.flaggedReports}</p>
          </div>
        </div>
      )}
    </div>
  );
}
