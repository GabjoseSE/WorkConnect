import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { profile } = useAuth();

  if (!profile) return <div style={{ padding: 24 }}>You don't have a profile yet.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Profile</h1>
      <div style={{ marginTop: 12 }}>
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>
    </div>
  );
}
