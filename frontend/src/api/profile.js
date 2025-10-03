export async function saveProfile(payload) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}
