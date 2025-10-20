import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployerApplications } from '../../api/applications';
import './Applicants.css';

export default function Applicants() {
  const { profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    if (!profile) return;
    // load all applications for this employer and derive jobs list, then merge with posted jobs
    const employerId = profile.userId || profile._id;
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
  }, [profile]);

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
                    <div className="app-meta">{new Date(a.applicationDate || a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="app-card-actions"><button className="wc-btn wc-btn-outline">View Profile</button></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
