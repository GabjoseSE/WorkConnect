import React from 'react';
import { useJobs } from '../../contexts/JobsContext';

export default function SavedJobs() {
  const { jobs, savedJobs } = useJobs();
  const savedList = jobs.filter(j => savedJobs.includes(j.id));

  return (
    <div style={{ padding: 24 }}>
      <h1>Saved Jobs</h1>
      {savedList.length === 0 ? (
        <p>You have no saved jobs yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {savedList.map(job => (
            <div key={job.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{job.title}</div>
                  <div style={{ color: '#666' }}>{job.company} · {job.location}</div>
                </div>
                <div style={{ color: '#018a66', fontWeight: 700 }}>{job.salary}</div>
              </div>
              <p style={{ color: '#444', marginTop: 8 }}>{job.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
