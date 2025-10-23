export async function getConversations(userId) {
  const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/messages/conversations?userId=${encodeURIComponent(userId)}`);
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

