import React from 'react';
import './dashboard.css';
import './JobseekerNotification.css';

export default function JobseekerNotification() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Jobseeker Notifications</h1>
        <p style={{ margin: 0, color: 'var(--wc-muted, #6b7280)' }}>Stay up to date with opportunities, application updates, interviews, and system announcements.</p>
      </header>

      <div className="card">
        <h2 className="overview-header">What you'll get</h2>
        <div className="overview-content">
          <div className="overview-item">
            <h3>New job postings</h3>
            <p>New job postings that match your saved preferences.</p>
            <button className="save-btn">Manage job preferences</button>
          </div>

          <div className="overview-item">
            <h3>Application updates</h3>
            <p>Application status updates: submitted, viewed, shortlisted, accepted, rejected.</p>
            <ul>
              <li>Submitted</li>
              <li>Viewed</li>
              <li>Shortlisted</li>
              <li>Accepted</li>
              <li>Rejected</li>
            </ul>
          </div>

          <div className="overview-item">
            <h3>Interview schedules & messages</h3>
            <p>Interview schedule or employer messages with quick actions.</p>
          </div>

          <div className="overview-item">
            <h3>System announcements</h3>
            <p>Feature updates, maintenance notices, and other system announcements.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Recent notifications</h2>
        <ul className="notification-types">
          <li className="notification-item">
            <div className="notif-left">
              <strong>New job: Frontend Engineer</strong>
              <div className="notif-desc">Matches your "React" preference — Acme Corp</div>
            </div>
            <div className="notif-actions">
              <button className="apply-btn">View</button>
            </div>
          </li>

          <li className="notification-item unread">
            <div>
              <strong>Application status: Frontend Engineer — Shortlisted</strong>
              <div className="notif-desc">Your application was shortlisted by Acme.</div>
            </div>
            <div>
              <button className="save-btn">Details</button>
            </div>
          </li>

          <li className="notification-item">
            <div>
              <strong>Interview scheduled</strong>
              <div className="notif-desc">Acme HR scheduled an interview — Fri, 10:00 AM</div>
            </div>
            <div>
              <button className="save-btn">Add to calendar</button>
            </div>
          </li>
        </ul>

        <p className="recent-activity">This page shows sample notifications. Connect real notifications via the app API.</p>
      </div>
    </div>
  );
}
