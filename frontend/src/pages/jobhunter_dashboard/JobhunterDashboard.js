import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './dashboard.css';

export default function JobhunterDashboard() {
  const { profile } = useAuth();

  
  const recommendedJobs = [
    { id: 1, title: 'Frontend Developer', location: 'Remote', company: 'Acme' },
    { id: 2, title: 'Full-stack Engineer', location: 'New York', company: 'BetaCorp' },
    { id: 3, title: 'UI/UX Designer', location: 'San Francisco', company: 'Designify' },
    { id: 4, title: 'Backend Developer', location: 'Remote', company: 'CloudNet' },
  ];

  const handleApply = (job) => {
    alert(`You applied for ${job.title} at ${job.company}`);
  };


  
   return (
    <div className="dashboard-content">
      <h1>Jobseeker Dashboard</h1>
      <p>Welcome{profile?.firstName ? `, ${profile.firstName}` : ''}!</p>

      {/* ✅ Overview Section */}
      <div className="overview-box">
        <h2 className="overview-header">Your Overview</h2>

        <div className="overview-content">
          <div className="overview-item">
            <h3>Profile Completeness</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '80%' }}></div>
            </div>
            <p>80% Complete</p>
          </div>

          <div className="overview-item">
            <h3>Applications Summary</h3>
            <ul>
              <li>Sent = 12</li>
              <li>Interviews = 1</li>
              <li>Offers = 2</li>
              <li>Rejections = 4</li>
            </ul>
          </div>

          <div className="overview-item">
            <h3>Notifications 🔔</h3>
            <p>You have 3 new messages from employers.</p>
          </div>
        </div>

        <p className="recent-activity">
          💡 You applied for 3 jobs this week. 1 interview scheduled for Friday.
        </p>
      </div>
      <div className="job-box">
        <h2 className="job-box-header">Recommended Jobs</h2>

        <div className="job-list">
          {recommendedJobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-info">
                <h3>{job.title}</h3>
                <p>
                  {job.company} — {job.location}
                </p>
              </div>
              <button onClick={() => handleApply(job)} className="apply-btn">
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
