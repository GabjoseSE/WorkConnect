export async function sendCode(contact, method = 'email') {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact, method }),
  });
  if (!res.ok) throw new Error('Failed to send code');
  return res.json();
}

export async function verifyCode(contact, code) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact, code }),
  });
  if (!res.ok) throw new Error('Failed to verify code');
  return res.json();
}
