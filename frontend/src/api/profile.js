export async function saveProfile(payload) {
  const token = payload.__token;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // remove internal-only token before sending body
  const bodyPayload = { ...payload };
  delete bodyPayload.__token;

  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export async function getOwnProfile(token) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}
