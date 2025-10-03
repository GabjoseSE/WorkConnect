export async function signup(payload) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to sign up');
  return res.json();
}
