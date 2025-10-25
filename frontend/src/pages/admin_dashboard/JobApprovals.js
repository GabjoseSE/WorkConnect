import React, { useEffect, useState } from 'react';

export default function JobApprovals() {
  const [pendingJobs, setPendingJobs] = useState([]);

  useEffect(() => {
    fetch('/api/admin/pending-jobs')
      .then(res => res.json())
      .then(data => setPendingJobs(data))
      .catch(err => console.error('Failed to fetch pending jobs:', err));
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

  const jobCard = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const jobInfo = {
    display: 'flex',
    flexDirection: 'column',
  };

  const jobTitle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#222',
  };

  const companyName = {
    fontSize: '14px',
    color: '#666',
  };

  const actionGroup = {
    display: 'flex',
    gap: '12px',
  };

  const approveBtn = {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  };

  const rejectBtn = {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  };

  return (
    <div style={container}>
      <h1 style={heading}>Job Approvals</h1>
      {pendingJobs.length > 0 ? (
        pendingJobs.map((job, i) => (
          <div key={i} style={jobCard}>
            <div style={jobInfo}>
              <span style={jobTitle}>{job.title}</span>
              <span style={companyName}>{job.companyName}</span>
            </div>
            <div style={actionGroup}>
              <button style={approveBtn}>Approve</button>
              <button style={rejectBtn}>Reject</button>
            </div>
          </div>
        ))
      ) : (
        <p>No pending jobs at the moment.</p>
      )}
    </div>
  );
}
