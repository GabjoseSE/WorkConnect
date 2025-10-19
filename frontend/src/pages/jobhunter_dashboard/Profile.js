import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';

export default function Profile() {
  const { profile } = useAuth(); // profile picture
  const navigate = useNavigate(); // password

  // fallback data when profile is not available
  const user = profile || {
    firstName: 'Philip',
    lastName: 'Maya',
    role: 'UI/UX Designer',
    location: 'Porto, Portugal',
    image: 'https://ui-avatars.com/api/?name=Philip+Maya&background=E0E7FF&color=1D4ED8',
  };

  const handleSettingsClick = () => {
    navigate('/settings'); // navigate to settings page (adjust route if needed)
  };

  // ✅ Resume (Mocked, backend ready)
  const resumes = [
    { name: "example_resume.pdf", uploadedAt: "3 days ago" },
  ];

  // ✅ Profile Completeness (Backend Ready)
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    // TODO: Connect this to backend when ready (PERCENTAGE BAR)
    // Expected backend endpoint: GET /api/profile/completeness
    // Expected response: { "percentage": number }

    fetch("/api/profile/completeness")
      .then((res) => res.json())
      .then((data) => setCompleteness(data.percentage))
      .catch(() => {
        console.log("Backend not connected yet — using fallback completeness");
        setCompleteness(80); // fallback for now
      });
  }, []);

  // ✅ My Activities (Backend Ready)
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // TODO: Connect this to backend when ready
    // Expected endpoint: GET /api/profile/activities
    // Expected response: 
    // [
    //   { company: "Meta Company", position: "Product Designer", location: "Porto, Portugal (On-site)", archivedAt: "5 days ago" },
    //   ...
    // ]

    fetch("/api/profile/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch(() => {
        console.log("Backend not connected yet — using fallback activities");
        setActivities([
          { company: "Meta Company", position: "Product Designer", location: "Porto, Portugal (On-site)", archivedAt: "5 days ago" },
          { company: "Google", position: "UX Researcher", location: "Lisbon, Portugal (Hybrid)", archivedAt: "1 week ago" },
          { company: "Apple", position: "Visual Designer", location: "Remote", archivedAt: "2 weeks ago" },
          { company: "Amazon", position: "Interaction Designer", location: "Madrid, Spain (On-site)", archivedAt: "3 weeks ago" },
          { company: "Microsoft", position: "UI Engineer", location: "Berlin, Germany (Remote)", archivedAt: "1 month ago" },
          { company: "Adobe", position: "Creative Designer", location: "Amsterdam, Netherlands (Hybrid)", archivedAt: "2 months ago" },
        ]);
      });
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* --- HEADER --- */}
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

          <div className="profile-header-right">
            <button className="settings-btn" onClick={handleSettingsClick}>
              Settings
            </button>
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
          {resumes.map((resume, index) => (
            <div className="resume-card" key={index}>
              <div className="resume-info">
                <div className="resume-icon">📄</div>
                <div>
                  <p className="resume-name">{resume.name}</p>
                  <p className="resume-date">Uploaded {resume.uploadedAt}</p>
                </div>
              </div>
              <button className="more-btn">⋮</button>
            </div>
          ))}
          <button className="add-more">+ Add more</button>
        </div>

        {/* --- PROFILE COMPLETENESS SECTION --- */}
        <div className="overview-content">
          <div className="overview-item">
            <h3>Profile Completeness</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <p>{completeness}% Complete</p>
          </div>
        </div>

        {/* --- MY ACTIVITIES SECTION (BACKEND READY) --- */}
        <div className="profile-section">
          <h3>My Activities</h3>
          <div className="activities-grid">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div className="activity-card" key={index}>
                  <div className="activity-header">
                    <p className="company">{activity.company}</p>
                  </div>
                  <h4>{activity.position}</h4>
                  <p className="activity-location">{activity.location}</p>
                  <p className="archived">Archived {activity.archivedAt}</p>
                </div>
              ))
            ) : (
              <p>No activities found</p>
            )}
          </div>
          <div className="show-all">Show All Info</div>
        </div>
      </div>
    </div>
  );
}
