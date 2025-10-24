import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployerApplications, getApplication } from '../../api/applications';
import { getOwnProfile } from '../../api/profile';
import './Applicants.css';

export default function Applicants() {
  const { profile, userId } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalApp, setModalApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [appError, setAppError] = useState(null);
  const [statusMap, setStatusMap] = useState({}); // applicationId -> status ('shortlist','rejected','hired')
  const [notesMap, setNotesMap] = useState({}); // applicationId -> notes string
  const [notesOpenFor, setNotesOpenFor] = useState(null);
  const [scheduleMap, setScheduleMap] = useState({}); // applicationId -> datetime string

  // close on escape key
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  useEffect(() => {
    // prefer profile.userId/_id but fall back to top-level userId from AuthContext if available
    const employerId = (profile && (profile.userId || profile._id)) || userId || null;
    if (!employerId) return;
    // load all applications for this employer and derive jobs list, then merge with posted jobs
  // Note: If AuthContext provides a separate userId (e.g. from login), use it — some consumers expect it at top-level
  // However this component only receives `profile` from useAuth; if needed, consider reading useAuth().userId directly.
    async function load() {
      try {
        const d = await getEmployerApplications(employerId);
        const applications = d.applications || [];
        setApps(applications);

        // derive job counts from applications
        const jobMap = {};
        applications.forEach(a => {
          const jid = a.jobId || 'unknown';
          jobMap[jid] = jobMap[jid] || { jobId: jid, title: a.jobTitle || 'Untitled', count: 0 };
          jobMap[jid].count += 1;
        });

        // fetch all jobs and merge titles / include jobs with zero applicants
        try {
          const base = process.env.REACT_APP_API_BASE || '';
          const res = await fetch(`${base}/api/jobs?createdBy=${encodeURIComponent(employerId)}`);
          if (res.ok) {
            const allJobs = await res.json();
            allJobs.forEach(j => {
              const jid = j._id;
              if (!jobMap[jid]) jobMap[jid] = { jobId: jid, title: j.title || 'Untitled', count: 0, logoUrl: j.logoUrl || j.logo || null };
              else {
                jobMap[jid].title = j.title || jobMap[jid].title;
                jobMap[jid].logoUrl = jobMap[jid].logoUrl || j.logoUrl || j.logo || null;
              }
            });
          }
          // if no jobs were returned for this createdBy, try fetching all jobs and match by company
          if (Object.keys(jobMap).length === 0) {
            try {
              const res2 = await fetch(`${base}/api/jobs`);
              if (res2.ok) {
                const all = await res2.json();
                all.forEach(j => {
                  const jid = j._id || j.id || 'unknown-' + (j.title || '') + String(Math.random()).slice(2,8);
                  // include if createdBy matches OR no createdBy and company matches profile.company
                  if (j.createdBy && String(j.createdBy) === String(employerId)) {
                    if (!jobMap[jid]) jobMap[jid] = { jobId: jid, title: j.title || 'Untitled', count: 0, logoUrl: j.logoUrl || j.logo || null };
                  } else if (!j.createdBy && profile && profile.company && String((j.company||'').trim()).toLowerCase() === String((profile.company||'').trim()).toLowerCase()) {
                    if (!jobMap[jid]) jobMap[jid] = { jobId: jid, title: j.title || 'Untitled', count: 0, logoUrl: j.logoUrl || j.logo || null };
                  }
                });
              }
            } catch (e) {
              console.warn('Fallback fetch all jobs failed', e);
            }
          }
        } catch (e) {
          // ignore job fetch errors; we still have job list derived from applications
          console.warn('Could not fetch jobs to merge with applications', e);
        }

        const jobList = Object.values(jobMap);
        setJobs(jobList);
        setSelectedJobId(s => s || (jobList[0] && jobList[0].jobId));
      } catch (e) {
        console.error('Error loading employer applications/jobs', e);
      }
    }
    load();
  }, [profile, userId]);

  const filtered = selectedJobId ? apps.filter(a => (a.jobId || 'unknown') === selectedJobId) : apps;

  return (
    <div className="employer-applicants-root">
      <div className="card job-posts">
        <div className="card-header">
          <h3>Job Posts</h3>
          <div className="search-box"><input className="wc-search" placeholder="Search" /></div>
        </div>
        <div className="card-body list-body">
          {jobs.length === 0 ? <div className="empty">No job posts yet</div> : (
            jobs.map(j => (
              <div key={j.jobId} className={`job-item ${selectedJobId === j.jobId ? 'active' : ''}`} onClick={() => setSelectedJobId(j.jobId)}>
                <div className="job-item-left">
                  <div className="job-avatar">
                    { j.logoUrl ? <img src={j.logoUrl} alt={`${j.title || 'Job'} logo`} /> : null }
                  </div>
                </div>
                <div className="job-item-body">
                  <div className="job-title">{j.title}</div>
                  <div className="job-meta">Applicants: {j.count}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card applicants-panel">
        <div className="card-header">
          <h3>Applicants for {jobs.find(j=>j.jobId===selectedJobId)?.title || 'All Jobs'}</h3>
          <div className="header-actions"><button className="wc-btn">Export Applicants</button></div>
        </div>
        <div className="card-body applicants-body">
          <div className="filters-row">
            <input className="wc-search" placeholder="Search" />
            <div className="tabs">
              <button className="tab active">All</button>
              <button className="tab">New</button>
              <button className="tab">Revised</button>
              <button className="tab">Filters</button>
            </div>
          </div>

          <div className="applicants-grid">
            {filtered.length === 0 ? <div className="empty">No applicants yet</div> : (
              filtered.map(a => (
                <div key={a._id} className="app-card">
                  <div className="app-card-left"><div className="avatar" /></div>
                  <div className="app-card-body">
                    <div className="app-name">{a.fullName}</div>
                    <div className="app-summary">{(a.skills || []).slice(0,3).join(', ')}</div>
                    <div className="app-meta">{"application date: " + new Date(a.applicationDate || a.createdAt).toLocaleDateString()}</div>
                    {statusMap[a._id] ? <span className="status-badge">{statusMap[a._id]}</span> : null}
                  </div>
                  <div className="app-card-actions">
                    <div className="app-actions">
                      <button className="wc-btn btn-view small" title="View Profile / Resume — review applicant qualifications" onClick={async () => {
                        setAppError(null);
                        setLoadingApp(true);
                        try {
                          const res = await getApplication(a._id || a.applicationId || a.id);
                          const app = (res && res.application) ? res.application : res;
                          let profileData = null;
                          try {
                            const applicantId = app.applicantId || app.applicant || null;
                            const email = app.email || app.contactEmail || app.applicantEmail || null;
                            if (applicantId) profileData = await getOwnProfile(null, applicantId, null);
                            else if (email) profileData = await getOwnProfile(null, null, email);
                          } catch (pfErr) { console.debug('No profile record found for applicant', pfErr); }
                          const merged = Object.assign({}, app, profileData || {});
                          setModalApp(merged);
                          setModalOpen(true);
                        } catch (e) {
                          console.error('Failed to load application', e);
                          setAppError('Could not load profile');
                        } finally { setLoadingApp(false); }
                      }}>{loadingApp ? 'Loading…' : 'View'}</button>

                      <button className="wc-btn btn-message small" title="Message / Contact — communicate directly" onClick={() => {
                        const email = a.email || a.contactEmail || a.applicantEmail || modalApp?.email;
                        const applicantId = a.applicantId || a.applicant || a.userId || a._id || null;
                        if (!applicantId && !email) {
                          alert('No contact available to message.');
                          return;
                        }
                        // Navigate to employer messages and pass applicant identifiers in location state.
                        navigate('/employer/messages', { state: { toApplicantId: applicantId, toEmail: email, toName: a.fullName } });
                      }}>
                        Message
                      </button>

                      <button className="wc-btn btn-shortlist" title="Shortlist — mark promising candidates" onClick={() => setStatusMap(prev => ({ ...prev, [a._id]: prev[a._id] === 'shortlist' ? undefined : 'shortlist' }))}>{statusMap[a._id] === 'shortlist' ? 'Shortlisted' : 'Shortlist'}</button>

                      <button className="wc-btn btn-reject" title="Reject / Decline — manage unqualified applicants" onClick={() => setStatusMap(prev => ({ ...prev, [a._id]: prev[a._id] === 'rejected' ? undefined : 'rejected' }))}>{statusMap[a._id] === 'rejected' ? 'Rejected' : 'Reject'}</button>

                      <button className="wc-btn btn-hire" title="Hire / Accept — finalize selection" onClick={() => setStatusMap(prev => ({ ...prev, [a._id]: prev[a._id] === 'hired' ? undefined : 'hired' }))}>{statusMap[a._id] === 'hired' ? 'Hired' : 'Hire'}</button>
                    </div>
                    
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="wc-modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => {
          // close when clicking backdrop
          if (e.target.classList && e.target.classList.contains('wc-modal-backdrop')) setModalOpen(false);
        }}>
          <div className="wc-modal">
            <h3>{modalApp ? (modalApp.fullName || modalApp.name || 'Applicant') : 'Applicant Profile'}</h3>
            {appError && <div className="signup-error">{appError}</div>}
            {!modalApp ? <p>Loading profile…</p> : (
              <div className="app-modal-body">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#eef2f2', overflow: 'hidden' }}>
                    { (modalApp.image || modalApp.profilePictureUrl) ? <img src={modalApp.image || modalApp.profilePictureUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>{(modalApp.fullName||modalApp.firstName||'U').split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                    ) }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{modalApp.fullName || ((modalApp.firstName || '') + ' ' + (modalApp.lastName || '')).trim()}</div>
                    <div style={{ color: '#6b7280' }}>{modalApp.role || modalApp.title || ''}</div>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>{modalApp.email || modalApp.ownerEmail || ''} {modalApp.phone || modalApp.contactNumber ? '· ' + (modalApp.phone || modalApp.contactNumber) : ''}</div>
                  </div>
                </div>

                <hr style={{ margin: '12px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <h4>About</h4>
                    <div style={{ color: '#475569', whiteSpace: 'pre-wrap' }}>{modalApp.bio || modalApp.companyDescription || modalApp.coverLetter || '—'}</div>

                    <h4 style={{ marginTop: 12 }}>Skills</h4>
                    <div>{(modalApp.skills || modalApp.skillsList || []).join ? (modalApp.skills || modalApp.skillsList).join(', ') : JSON.stringify(modalApp.skills) || '—'}</div>

                    <h4 style={{ marginTop: 12 }}>Education</h4>
                    <div>
                      {(modalApp.education && modalApp.education.length) ? modalApp.education.map((ed,i) => (
                        <div key={i} style={{ marginBottom: 8 }}><strong>{ed.school}</strong> — {ed.degree} {ed.startYear ? `(${ed.startYear}${ed.endYear ? ' – ' + ed.endYear : ''})` : ''}</div>
                      )) : <div>—</div>}
                    </div>
                  </div>

                  <div>
                    <h4>Experience</h4>
                    <div>
                      {(modalApp.workExperience && modalApp.workExperience.length) ? modalApp.workExperience.map((we,i) => (
                        <div key={i} style={{ marginBottom: 8 }}><strong>{we.position}</strong> · {we.company} <div style={{ color: '#6b7280' }}>{we.duration}</div><div style={{ marginTop: 6 }}>{we.description}</div></div>
                      )) : <div>—</div>}
                    </div>

                    <h4 style={{ marginTop: 12 }}>Location</h4>
                    <div>{modalApp.location || modalApp.companyLocation || [modalApp.city, modalApp.stateprovince, modalApp.country].filter(Boolean).join(', ') || '—'}</div>

                    <h4 style={{ marginTop: 12 }}>Documents</h4>
                    <div>
                      {modalApp.resumeUrl ? <a href={modalApp.resumeUrl} target="_blank" rel="noreferrer">View resume</a> : (modalApp.resume ? <a href={modalApp.resume} target="_blank" rel="noreferrer">View resume</a> : '—')}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button className="secondary" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {notesOpenFor && (
        <div className="wc-modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target.classList && e.target.classList.contains('wc-modal-backdrop')) setNotesOpenFor(null); }}>
          <div className="wc-modal">
            <h3>Notes / Feedback</h3>
            <textarea value={notesMap[notesOpenFor] || ''} onChange={(e) => setNotesMap(prev => ({ ...prev, [notesOpenFor]: e.target.value }))} style={{ width: '100%', minHeight: 160, padding: 12, borderRadius: 8, border: '1px solid #e6e6e9' }} />
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="secondary" onClick={() => setNotesOpenFor(null)}>Cancel</button>
              <button className="wc-btn" onClick={() => { setNotesOpenFor(null); alert('Notes saved'); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
