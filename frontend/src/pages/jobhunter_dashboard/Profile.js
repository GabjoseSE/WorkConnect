import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './profile.css';

export default function Profile() {
  const { profile } = useAuth();

  // fallback data when profile is not available
  const user = profile || {
    firstName: 'Philip',
    lastName: 'Maya',
    role: 'UI/UX Designer',
    location: 'Porto, Portugal',
    image: 'https://ui-avatars.com/api/?name=Philip+Maya&background=E0E7FF&color=1D4ED8',
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar">
              <img src={user.image} alt="Profile" />
              <button className="edit-avatar-btn">✏️</button>
            </div>
            <div>
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="job-title">{user.role}</p>
              <p className="location">{user.location}</p>
            </div>
          </div>
        </div>

        {/* --- ABOUT SECTION --- */}
        <div className="profile-section">
          <h3>About</h3>
          <div className="info-grid">
            <div>
              <span className="label">Employment Status</span>
              <p>Not Employed</p>
            </div>
            <div>
              <span className="label">Full Name</span>
              <p>{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <span className="label">Job Title</span>
              <p>{user.role}</p>
            </div>
            <div>
              <span className="label">Location</span>
              <p>{user.location}</p>
            </div>
          </div>
          <div className="show-all">Show All Info</div>
        </div>

        {/* --- RESUME SECTION --- */}
        <div className="profile-section">
          <h3>Resume</h3>
          <div className="resume-card">
            <div className="resume-info">
              <div className="resume-icon">📄</div>
              <div>
                <p className="resume-name">philip_resume.pdf</p>
                <p className="resume-date">Uploaded 3 days ago</p>
              </div>
            </div>
            <button className="more-btn">⋮</button>
          </div>
          <button className="add-more">+ Add more</button>
        </div>

        {/* --- ACTIVITIES SECTION --- */}
        <div className="profile-section">
          <h3>My Activities</h3>
          <div className="activities-grid">
            <div className="activity-card">
              <div className="activity-header">
                <p className="company">Meta company</p>
              </div>
              <h4>Product Designer</h4>
              <p className="activity-location">Porto, Portugal (On-site)</p>
              <p className="archived">Archived 5 days ago</p>
            </div>

            <div className="activity-card">
              <div className="activity-header">
                <p className="company">Meta company</p>
              </div>
              <h4>Product Designer</h4>
              <p className="activity-location">Porto, Portugal (On-site)</p>
              <p className="archived">Archived 5 days ago</p>
            </div>
          </div>
          <div className="show-all">Show All Info</div>
        </div>
      </div>
    </div>
  );
}
