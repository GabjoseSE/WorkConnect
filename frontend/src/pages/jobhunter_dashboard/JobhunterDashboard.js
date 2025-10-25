import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './dashboard.css';
import { uploadFile } from '../../api/upload';
import { sendApplication } from '../../api/applications';
import { getConversations } from '../../api/messages';

export default function JobhunterDashboard() {
  const { profile, token, userId, setProfile } = useAuth();

  // Mock/sample data for demonstration — replace with real API calls later
  const [resume, setResume] = useState(profile?.resume || null);

  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const [appliedJobs, setAppliedJobs] = useState([
    { id: 'a1', jobId: 2, title: 'Full-stack Engineer', company: 'BetaCorp', status: 'pending' },
  ]);

  const [savedJobs, setSavedJobs] = useState([3]); // store jobId's

  const [notifications, setNotifications] = useState([
    { id: 'n1', text: 'Your profile was viewed 5 times this week', read: false },
    { id: 'n2', text: 'Interview invite from Acme — Friday 10am', read: false },
  ]);

  const [messages, setMessages] = useState([
    { id: 'm1', from: 'Acme HR', subject: 'Next steps', snippet: 'We enjoyed your application...', unread: true },
  ]);

  const handleApply = (job) => {
    // If already applied, inform user
    const jid = job._id || job.id;
    if (appliedJobs.find((a) => String(a.jobId) === String(jid))) {
      alert(`You already applied to ${job.title} at ${job.company}`);
      return;
    }

    // Build payload for API
    const payload = {
      applicantId: userId,
      employerId: job.createdBy || null,
      jobId: job._id || job.id,
      jobTitle: job.title,
      fullName: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : '',
      email: profile?.email || '',
      resumeUrl: resume?.url || profile?.resume?.url || null,
      applicationDate: new Date().toISOString(),
    };

    sendApplication(payload).then((res) => {
      const app = res && res.application ? res.application : { id: `app-${Date.now()}`, jobId: payload.jobId, title: job.title, company: job.company, status: 'pending' };
      setAppliedJobs((prev) => [app, ...prev]);
      alert(`Applied to ${job.title} at ${job.company}`);
    }).catch((err) => {
      console.error('Failed to send application', err);
      alert('Failed to submit application. Please try again.');
    });
  };

  const toggleSave = (job) => {
    const jid = job._id || job.id;
    setSavedJobs((prev) => (prev.includes(jid) ? prev.filter((id) => id !== jid) : [jid, ...prev]));
  };

  const handleUploadResume = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // upload file to server
    (async () => {
      try {
        const res = await uploadFile(file);
        // res expected { url }
        const r = { name: file.name, url: res.url, uploadedAt: new Date().toISOString() };
        setResume(r);
        // persist to profile if available
        if (setProfile) setProfile({ ...profile, resume: r });
        alert(`Uploaded resume: ${file.name}`);
      } catch (err) {
        console.error('Upload failed', err);
        alert('Upload failed. Please try again.');
      }
    })();
  };

  // fetch recommended jobs and conversations when userId available
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const base = process.env.REACT_APP_API_URL || '';
        const jobsRes = await fetch(`${base}/api/jobs`);
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          if (!cancelled) setRecommendedJobs(Array.isArray(jobs) ? jobs : []);
        }
      } catch (err) {
        console.warn('Failed to load jobs', err);
      }

      try {
        if (userId) {
          const conv = await getConversations(userId);
          if (!cancelled && Array.isArray(conv)) {
            // convert conversations to message-summary items
            const msgs = conv.map((c, idx) => ({ id: c._id || c.id || `c${idx}`, from: c.with || c.title || 'Conversation', subject: c.preview || '', snippet: c.preview || '', unread: !!c.unread }));
            setMessages(msgs);
          }
        }
      } catch (err) {
        console.warn('Failed to load conversations', err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markMessageRead = (id) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

  // Analytics derived values
  const analytics = {
    totalApplications: appliedJobs.length,
    savedJobs: savedJobs.length,
    profileViews: 42, // placeholder
    jobsViewed: 128, // placeholder
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Left column: Profile, Notifications, Messages */}
        <aside className="left-col">
          <section className="profile-summary card">
            <div className="profile-top">
              <div className="avatar">{profile?.firstName ? profile.firstName[0] : 'J'}</div>
              <div className="profile-meta">
                <h2>{profile?.firstName || 'Jobseeker'} {profile?.lastName || ''}</h2>
                <p className="profession">{profile?.profession || 'Job Hunter'}</p>
              </div>
            </div>
            <p className="bio">{profile?.bio || 'Add a short bio to let employers know who you are.'}</p>

            <div className="skills">
              <strong>Skills:</strong>
              <div className="skill-list">{profile?.skills?.join(', ') || 'React, JavaScript, CSS'}</div>
            </div>

            <div className="resume-upload">
              <label className="upload-label">Resume:</label>
              <div className="resume-row">
                <input type="file" onChange={handleUploadResume} />
                <div className="resume-info">{resume ? resume.name : 'No resume uploaded'}</div>
              </div>
            </div>
          </section>

          <section className="notifications card">
            <h3>Notifications</h3>
            {notifications.length === 0 && <p>No notifications</p>}
            <ul>
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? 'read' : 'unread'}>
                  <div>{n.text}</div>
                  {!n.read && <button onClick={() => markNotificationRead(n.id)}>Mark read</button>}
                </li>
              ))}
            </ul>
          </section>

          <section className="messages card">
            <h3>Inbox</h3>
            {messages.length === 0 && <p>No messages</p>}
            <ul>
              {messages.map((m) => (
                <li key={m.id} className={m.unread ? 'unread' : ''}>
                  <div className="msg-from">{m.from}</div>
                  <div className="msg-subject">{m.subject}</div>
                  <div className="msg-snippet">{m.snippet}</div>
                  {m.unread && <button onClick={() => markMessageRead(m.id)}>Mark read</button>}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main column: Recommendations, Applied, Saved, Analytics, Settings, Help */}
        <main className="main-col">
          <section className="recommended card">
            <h2>Recommended Jobs</h2>
            <div className="job-list">
              {recommendedJobs.map((job) => (
                <div className="job-card" key={job._id || job.id}>
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="meta">{job.company} — {job.location}</p>
                  </div>
                  <div className="job-actions">
                    <button className="apply-btn" onClick={() => handleApply(job)}>Apply</button>
                    <button className="save-btn" onClick={() => toggleSave(job)}>{savedJobs.includes(job._id || job.id) ? 'Saved' : 'Save'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="applied card">
            <h2>Applied Jobs</h2>
            {appliedJobs.length === 0 ? <p>No applications yet</p> : (
              <table className="applied-table">
                <thead>
                  <tr><th>Job</th><th>Company</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appliedJobs.map((a) => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{a.company}</td>
                      <td className={`status ${a.status}`}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="saved card">
            <h2>Saved Jobs</h2>
            {savedJobs.length === 0 ? <p>No saved jobs</p> : (
              <ul>
                {savedJobs.map((id) => {
                  const job = recommendedJobs.find((j) => (j._id || j.id) === id) || { id, title: 'Unknown' };
                  return (
                    <li key={id}>
                      {job.title} — {job.company}
                      <button onClick={() => toggleSave(job)}>Remove</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="analytics card">
            <h2>Activity Summary</h2>
            <div className="analytics-grid">
              <div className="metric">
                <div className="metric-value">{analytics.totalApplications}</div>
                <div className="metric-label">Applications</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analytics.jobsViewed}</div>
                <div className="metric-label">Jobs Viewed</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analytics.profileViews}</div>
                <div className="metric-label">Profile Views</div>
              </div>
              <div className="metric">
                <div className="metric-value">{analytics.savedJobs}</div>
                <div className="metric-label">Saved Jobs</div>
              </div>
            </div>
          </section>

          <section className="settings-help card">
            <div className="settings">
              <h3>Account Settings</h3>
              <p>Edit your personal info, change password, and manage preferences.</p>
              <button className="edit-btn">Edit Profile</button>
            </div>

            <div className="help">
              <h3>Help & Support</h3>
              <p>Check our FAQs or contact support if you need help.</p>
              <button className="contact-btn">Contact Support</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
