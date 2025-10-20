import React from 'react';
import { useJobs } from '../../contexts/JobsContext';
import './SavedJobs.css';

export default function SavedJobs() {
  const { jobs, savedJobs, savedJobIds, toggleSave } = useJobs();
  // join job metadata with saved info (savedAt)
  const savedList = savedJobs.map(s => {
    const job = jobs.find(j => String(j.id || j._id) === String(s.id));
    return { ...s, job };
  }).filter(x => x.job);

  return (
    <div className="saved-jobs-root" style={{ padding: 24 }}>
      <h1 className="saved-jobs-title">Saved</h1>
      {savedList.length === 0 ? (
        <p className="saved-empty">You have no saved jobs yet.</p>
      ) : (
        <div className="saved-list">
          {savedList.map(item => (
            <div key={item.id} className="saved-item">
              <div className="saved-item-left">
                <div className="saved-avatar">{item.job.logoUrl ? <img src={item.job.logoUrl} alt={item.job.company} /> : <div className="avatar-placeholder" />}</div>
                <div className="saved-info">
                  <div className="saved-title">{item.job.title}</div>
                  <div className="saved-company">{item.job.company}</div>
                  <div className="saved-location">{item.job.location}</div>
                  <div className="saved-meta">{item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Saved'}</div>
                </div>
              </div>
              <div className="saved-item-right">
                <button className="wc-btn wc-btn-primary">Apply now</button>
                <button className="wc-btn wc-btn-icon" aria-label="Remove" title="Remove" onClick={() => toggleSave(item.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2h12v18l-6-3-6 3V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="wc-btn wc-btn-icon" aria-label="More">...</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
