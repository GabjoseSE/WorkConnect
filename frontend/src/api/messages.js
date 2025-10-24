export async function getConversations(userId, archived = false) {
  const params = new URLSearchParams();
  params.set('userId', userId);
  if (archived) params.set('archived', 'true');
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/conversations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function getMessages(conversationId) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(payload) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let txt = 'Failed to send message';
    try { const d = await res.json(); if (d && d.error) txt = d.error; } catch (e) {}
    throw new Error(txt);
  }
  return res.json();
}

export async function startConversation(from, to, title = '') {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, title }),
  });
  if (!res.ok) throw new Error('Failed to start conversation');
  return res.json();
}

export async function archiveConversation(conversationId, userId, archived = true) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/conversations/${encodeURIComponent(conversationId)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived, userId })
  });
  if (!res.ok) throw new Error('Failed to archive conversation');
  return res.json();
}

export async function deleteConversation(conversationId) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/conversations/${encodeURIComponent(conversationId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation');
  return res.json();
}

