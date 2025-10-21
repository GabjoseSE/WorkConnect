import React from 'react';
import './Application.css';

export default function Applications() {
  // no applications by default — empty state will be shown until data is wired in
  const applications = [];
  const hasApps = false;

  return (
    <div className="applications-root page-content" style={{ padding: 24 }}>
      <div className="applications-header">


        <div className="applications-actions">
          <label className="sort-label">Sort by:</label>
          <select className="wc-select">
            <option>Newest</option>
            <option>Oldest</option>
          </select>
          <div className="status-pills">
            {['All', 'Revised', 'Interview', 'Hired', 'Rejected'].map(s => (
              <button key={s} className={`wc-btn wc-btn-outline pill`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {hasApps ? (
        <div className="applications-table-wrap">
          <table className="applications-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Job Title</th>
                <th>Company Name</th>
                <th>Date Applied</th>
                <th>Application Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a, i) => (
                <tr key={a.id}>
                  <td className="mono">{i + 1}</td>
                  <td>{a.title}</td>
                  <td>{a.company}</td>
                  <td>{a.appliedAt}</td>
                  <td>{a.status}</td>
                  <td>
                    <button className="wc-btn wc-btn-outline small">[Withdraw]</button>
                    <button className="wc-btn wc-btn-outline small">[View Detail]</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="applications-empty">
          <div className="empty-card">
            <div className="empty-illustration" aria-hidden />
            <div>
              <p className="empty-text">You haven't applied for any jobs yet. Start exploring opportunities on the <strong>Job Search</strong> page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
