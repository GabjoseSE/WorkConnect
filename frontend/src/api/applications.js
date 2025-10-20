const API_BASE = process.env.REACT_APP_API_BASE || '';

export async function sendApplication(payload) {
  const res = await fetch(`${API_BASE}/api/applications/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getEmployerApplications(employerId) {
  const res = await fetch(`${API_BASE}/api/applications/employer/${encodeURIComponent(employerId)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getApplication(id) {
  const res = await fetch(`${API_BASE}/api/applications/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
