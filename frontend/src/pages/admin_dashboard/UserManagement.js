import React, { useEffect, useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const container = {
    padding: '32px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const heading = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
  };

  const userCard = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const nameRole = {
    display: 'flex',
    flexDirection: 'column',
  };

  const roleTag = {
    fontSize: '14px',
    color: '#666',
  };

  const actionButton = {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  };

  return (
    <div style={container}>
      <h1 style={heading}>User Management</h1>
      {users.length > 0 ? (
        users.map((user, i) => (
          <div key={i} style={userCard}>
            <div style={nameRole}>
              <strong>{user.fullName}</strong>
              <span style={roleTag}>{user.role}</span>
            </div>
            <button style={actionButton}>Suspend</button>
          </div>
        ))
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
