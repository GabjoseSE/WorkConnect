export async function signup(payload) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to sign up');
  return res.json();
}

export async function login(payload) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || 'Failed to login');
  }
  return res.json();
}
