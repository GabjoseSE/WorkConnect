import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployerApplications } from '../../api/applications';

export default function Applicants() {
  const { profile } = useAuth();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (!profile) return;
    getEmployerApplications(profile.userId || profile._id).then(d => setApps(d.applications || [])).catch(() => {});
  }, [profile]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Applicants</h2>
      <p>View received applications for your jobs.</p>
      <div style={{ marginTop: 12 }}>
        {apps.length === 0 ? <div>No applications yet</div> : (
          apps.map(a => (
            <div key={a._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{a.fullName} <span style={{ fontWeight: 400, color: '#666' }}>— {a.jobTitle}</span></div>
                  <div style={{ color: '#666' }}>{a.email} · {a.contactNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(a.applicationDate || a.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>{a.status}</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>{a.coverLetter}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
