import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployerDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] = useState({
    activeJobs: [],
    totalApplicants: 0,
    ongoingInterviews: [],
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch dashboard stats:', err));
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  };

  const squareCard = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '200px',
  };

  const sectionTitle = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#222',
  };

  const boldText = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
  };

  const pendingSection = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  };

  const pendingList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const pendingItem = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  };

  const leftInfo = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const circle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#f97316',
  };

  const nameRole = {
    display: 'flex',
    flexDirection: 'column',
  };

  const lightText = {
    color: '#666',
    fontSize: '14px',
  };

  const status = {
    fontSize: '14px',
    color: '#444',
  };

  const viewLink = {
    color: '#0078d4',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '500',
  };

  return (
    <div style={container}>
      <div>
        <h1 style={heading}>Employer Dashboard</h1>
        <p style={subheading}>
          Welcome{profile?.companyName ? `, ${profile.companyName}` : ''} — manage your jobs and candidates here.
        </p>
      </div>

      <div style={grid}>
        <div style={squareCard}>
          <p style={sectionTitle}>Active Job Posts</p>
          {stats.activeJobs.length > 0 ? (
            <ul>
              {stats.activeJobs.map((job, i) => (
                <li key={i} style={lightText}>{job.title}</li>
              ))}
            </ul>
          ) : (
            <p style={lightText}>No active jobs yet.</p>
          )}
        </div>
        <div style={squareCard}>
          <p style={sectionTitle}>Total Applicants</p>
          <p style={boldText}>{stats.totalApplicants}</p>
        </div>
        <div style={squareCard}>
          <p style={sectionTitle}>Ongoing Interviews</p>
          <p style={boldText}>{stats.ongoingInterviews.length}</p>
        </div>
      </div>

      <div style={pendingSection}>
        <p style={sectionTitle}>Pending Approvals</p>
        <div style={pendingList}>
          {stats.activeJobs.slice(0, 3).map((job, i) => (
            <div key={i} style={pendingItem}>
              <div style={leftInfo}>
                <div style={circle}></div>
                <div style={nameRole}>
                  <span style={boldText}>Jane Smith</span>
                  <span style={lightText}>{job.title}</span>
                </div>
              </div>
              <span style={lightText}>06/Dec/2024</span>
              <span style={status}>In Review ⌄</span>
              <a href="#" style={viewLink}>View Details</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
