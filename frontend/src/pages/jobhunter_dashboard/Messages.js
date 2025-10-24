import React, { useEffect, useState, useRef } from 'react';
import './Messages.css';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, getMessages, sendMessage, startConversation, archiveConversation, deleteConversation } from '../../api/messages';
import { getOwnProfile } from '../../api/profile';
import { useLocation } from 'react-router-dom';

function initialsFromTitle(title) {
  if (!title) return 'U';
  const parts = title.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Messages() {
  const { profile, token } = useAuth();
  const userId = profile?.userId || profile?._id || null;
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [convoMenuOpen, setConvoMenuOpen] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherName, setOtherName] = useState('');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const threadRef = useRef(null);
  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;
    // fetch conversations; if filter is 'Archived' request archived convos from server
    getConversations(userId, filter === 'Archived')
      .then(d => {
        const list = (d.conversations || []).map(c => ({ ...c, archived: Array.isArray(c.archivedBy) && c.archivedBy.includes(userId) }));
        setConvos(list);
      })
      .catch(() => {});
  }, [userId, filter]);

  useEffect(() => {
    if (!selected) return;
    getMessages(selected._id).then(d => setMessages(d.messages || [])).catch(() => {});
    // determine display name for the selected conversation
    (async () => {
      try {
        if (selected.title) {
          setOtherName(selected.title);
          return;
        }
        // try to find the other participant (not current user)
        const other = Array.isArray(selected.participants) ? selected.participants.find(p => String(p) !== String(userId)) : null;
        if (!other) {
          setOtherName('Conversation');
          return;
        }

        // If participant object is populated (not just id), prefer company/fullName directly
        if (typeof other === 'object' && other !== null) {
          const name = other.company || other.fullName || ((other.firstName || '') + ' ' + (other.lastName || '')).trim() || other.email || JSON.stringify(other);
          setOtherName(name || 'Conversation');
          return;
        }

        // other might be an email or a userId string
        let profileRes = null;
        try {
            if (typeof other === 'string' && other.includes('@')) {
              profileRes = await getOwnProfile(token, null, other);
            } else {
              profileRes = await getOwnProfile(token, other, null);
            }
        } catch (e) {
          // ignore profile fetch errors
        }
        if (profileRes && (profileRes.company || profileRes.fullName || profileRes.firstName)) {
          const name = profileRes.company || profileRes.fullName || ((profileRes.firstName || '') + ' ' + (profileRes.lastName || '')).trim() || profileRes.email || other;
          setOtherName(name || 'Conversation');
        } else {
          // fallback to participant id/email
          setOtherName(typeof other === 'string' ? other : 'Conversation');
        }
      } catch (e) {
        setOtherName('Conversation');
      }
    })();
  }, [selected, userId, token]);

  // clear otherName when no selection
  useEffect(() => {
    if (!selected) setOtherName('');
  }, [selected]);

  // WebSocket: subscribe to live message events for this user and update convos/messages in real-time.
  // Assumptions: backend exposes a JSON WebSocket endpoint at REACT_APP_WS_URL or at /ws/messages on the same host.
  useEffect(() => {
    if (!userId) return;
    const wsUrl = process.env.REACT_APP_WS_URL || ((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/messages');
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      console.debug('[Messages] Attempting WebSocket connection to', wsUrl);
    } catch (e) {
      console.warn('[Messages] WebSocket construct failed', e);
      startPolling();
      return;
    }

    ws.onopen = () => {
      console.debug('[Messages] WebSocket open');
      // stop polling if running
      stopPolling();
      try { ws.send(JSON.stringify({ type: 'subscribe', userId })); } catch (e) { /* ignore */ }
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // Expecting data.type === 'message' or 'conversation_update'
        if (!data) return;

        console.debug('[Messages] WS onmessage', data);

        if (data.type === 'message' || data.type === 'new_message') {
          const message = data.message || data;
          // append to active thread if it matches
          if (message && selected && String(message.conversationId) === String(selected._id)) {
            setMessages(prev => [...prev, message]);
          }

          // update conversation list (lastMessage, updatedAt, unreadCount)
          setConvos(prev => {
            const idx = prev.findIndex(c => String(c._id) === String(message.conversationId));
            if (idx >= 0) {
              const updated = [...prev];
              const hit = { ...updated[idx] };
              hit.lastMessage = message.body || hit.lastMessage;
              hit.updatedAt = message.createdAt || hit.updatedAt || new Date().toISOString();
              // increment unread if not currently selected
              if (!selected || String(selected._id) !== String(hit._id)) hit.unreadCount = (hit.unreadCount || 0) + 1;
              updated[idx] = hit;
              // move to front
              updated.splice(idx, 1);
              return [hit, ...updated];
            }
            // If conversation not found, prepend a minimal placeholder
            const placeholder = {
              _id: message.conversationId || ('conv-' + Math.random().toString(36).slice(2,9)),
              participants: [message.from, message.to].filter(Boolean),
              title: data.title || message.title || null,
              lastMessage: message.body,
              updatedAt: message.createdAt || new Date().toISOString(),
              unreadCount: 1,
            };
            return [placeholder, ...prev];
          });
        } else if (data.type === 'conversation_update' || data.type === 'conversation') {
          const conv = data.conversation || data;
          if (!conv || !conv._id) return;
          setConvos(prev => {
            const idx = prev.findIndex(c => String(c._id) === String(conv._id));
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...conv };
              // move to front
              const hit = updated.splice(idx, 1)[0];
              return [ { ...hit, ...conv }, ...updated ];
            }
            return [conv, ...prev];
          });
        }
      } catch (e) {
        console.debug('WS message parse error', e);
      }
    };

    ws.onclose = () => { wsRef.current = null; };
    ws.onerror = (err) => { console.debug('[Messages] WebSocket error', err); startPolling(); };

    return () => {
      try { if (ws && ws.readyState === WebSocket.OPEN) ws.close(); } catch (e) {}
      wsRef.current = null;
      stopPolling();
    };
  }, [userId, selected, convos]);

  // Polling fallback: refresh conversations/messages every few seconds when WS is not available
  function startPolling() {
    if (pollRef.current) return;
    console.debug('[Messages] Starting polling fallback');
    pollRef.current = setInterval(async () => {
      try {
        if (userId) {
          const c = await getConversations(userId, filter === 'Archived');
          const list = (c.conversations || []).map(c => ({ ...c, archived: Array.isArray(c.archivedBy) && c.archivedBy.includes(userId) }));
          setConvos(list);
          if (selected && selected._id) {
            const d = await getMessages(selected._id);
            setMessages(d.messages || []);
          }
        }
      } catch (e) {
        console.debug('[Messages] Polling fetch failed', e);
      }
    }, 4000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      console.debug('[Messages] Stopped polling fallback');
    }
  }

  // If we were navigated here with state requesting a conversation start, try to select or create it
  useEffect(() => {
    const state = location && location.state;
    if (!state) return;
    const target = state.toApplicantId || state.toEmail || state.toUserId || null;
    const title = state.toName || '';
    if (!target || !userId) return;

    // If a conversation with that participant already exists, open it
    const existing = convos.find(c => Array.isArray(c.participants) && c.participants.some(p => String(p) === String(target)));
    if (existing) {
      setSelected(existing);
      return;
    }

    // otherwise, start a new conversation then refresh list and select the new one
    (async () => {
      try {
        const res = await startConversation(userId, target, title);
        const conv = (res && (res.conversation || res.conversationCreated)) ? (res.conversation || res.conversationCreated) : res;
    const d = await getConversations(userId, filter === 'Archived');
    // normalize archived flag
    const list = (d.conversations || []).map(c => ({ ...c, archived: Array.isArray(c.archivedBy) && c.archivedBy.includes(userId) }));
    setConvos(list);
    const newConv = (conv && conv._id) ? (list || []).find(c => c._id === conv._id) : null;
        setSelected(newConv || conv || (d.conversations && d.conversations[0]) || null);
      } catch (e) {
        console.warn('Could not start/select conversation from navigation state', e);
      }
    })();
  }, [location && location.state, userId, convos]);

  useEffect(() => {
    // scroll to bottom on new message
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!text || !userId) return;
    try {
      const res = await sendMessage({ conversationId: selected?._id, from: userId, to: selected?.participants?.find(p => p !== userId), body: text, title: selected?.title });
      setMessages(prev => [...prev, res.message]);
      setText('');
      // refresh convos
      const c = await getConversations(userId, filter === 'Archived');
      const list = (c.conversations || []).map(c => ({ ...c, archived: Array.isArray(c.archivedBy) && c.archivedBy.includes(userId) }));
      setConvos(list);
    } catch (e) {
      console.warn('Send failed', e);
    }
  };

  const filteredConvos = convos.filter(c => {
    if (!c) return false;
    if (filter === 'Unread') {
      // placeholder: backend doesn't provide unread count yet
      return (c.unreadCount || 0) > 0;
    }
    if (filter === 'Archived') return !!c.archived;
    if (search.trim()) {
      const t = (c.title || '').toLowerCase();
      return t.includes(search.toLowerCase());
    }
    return true;
  });

  // close convo menu on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!convoMenuOpen) return;
      // if click target is inside an open menu or its button, keep it
      const el = document.getElementById(`convo-menu-${convoMenuOpen}`);
      if (el && el.contains(e.target)) return;
      const btn = document.getElementById(`convo-btn-${convoMenuOpen}`);
      if (btn && btn.contains(e.target)) return;
      setConvoMenuOpen(null);
    }
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, [convoMenuOpen]);

  const toggleConvoMenu = (id) => {
    setConvoMenuOpen(prev => prev === id ? null : id);
  };

  const handleArchiveConvo = async (id) => {
    // optimistic toggle locally
    setConvos(prev => prev.map(c => c._id === id ? { ...c, archived: !c.archived } : c));
    // close menu
    setConvoMenuOpen(null);
    // if user archived the selected convo, deselect it
    if (selected && selected._id === id) setSelected(null);
    try {
      const current = convos.find(c => c._id === id);
      const newArchived = !(current && current.archived);
      await archiveConversation(id, userId, newArchived);
      // refresh list from server to ensure consistent archivedBy mapping
      const c = await getConversations(userId, filter === 'Archived');
      const list = (c.conversations || []).map(c => ({ ...c, archived: Array.isArray(c.archivedBy) && c.archivedBy.includes(userId) }));
      setConvos(list);
    } catch (e) {
      console.debug('Archive request failed', e);
    }
  };

  const handleDeleteConvo = async (id) => {
    // optimistic UI: remove from list
    setConvos(prev => prev.filter(c => c._id !== id));
    if (selected && selected._id === id) setSelected(null);
    setConvoMenuOpen(null);
    // try to call backend delete if endpoint is present; ignore errors
    try {
      // use API helper
      await deleteConversation(id);
    } catch (e) {
      console.debug('Delete convo request failed (expected if API missing)', e);
    }
  };

  const openDeleteModal = (id, title) => {
    setDeleteTarget({ id, title });
    setShowDeleteModal(true);
    // close any open menu
    setConvoMenuOpen(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="messages-root">
      <div className="messages-card">
        <aside className="messages-list">
          <div className="panel panel-left">
            <div className="panel-header">
              <div className="panel-title">Conversations</div>
            </div>
            <div className="panel-body">
              <div className="messages-search"><input className="wc-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations" /></div>
              <div className="messages-filters">
                {['All','Unread','Archived'].map(f => (
                  <button key={f} className={`filter-btn ${filter===f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>

              <div className="messages-convos">
                {filteredConvos.map(c => (
                  <div key={c._id} className={`messages-convo ${selected && selected._id === c._id ? 'active' : ''}`} onClick={() => setSelected(c)}>
                    <div className="convo-left">
                      <div className="avatar">{initialsFromTitle(c.title)}</div>
                    </div>
                    <div className="convo-body">
                      <div className="convo-title-row">
                        <div className="convo-title">{c.title || (c.participants && c.participants.join(', ')) || 'Conversation'}</div>
                        <div className="convo-time">{c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                      </div>
                      <div className="convo-last">{c.lastMessage}</div>
                    </div>
                    <div className="convo-right">
                      {c.unreadCount > 0 && <div className="unread-badge">{c.unreadCount}</div>}
                    </div>
                    <div className="convo-actions">
                      <button id={`convo-btn-${c._id}`} className="three-dot-btn" aria-label="Conversation actions" onClick={(e) => { e.stopPropagation(); toggleConvoMenu(c._id); }}>⋯</button>
                      {convoMenuOpen === c._id && (
                        <div id={`convo-menu-${c._id}`} className="convo-menu" role="menu">
                          <button role="menuitem" onClick={(e) => { e.stopPropagation(); handleArchiveConvo(c._id); }}>
                            {c.archived ? 'Unarchive' : 'Archive'}
                          </button>
                          <button role="menuitem" onClick={(e) => { e.stopPropagation(); openDeleteModal(c._id, c.title); }}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="messages-thread">
          <div className="panel panel-right">
            <div className="panel-header">
              <div className="panel-title">{selected ? (otherName || selected.title || 'Conversation') : 'Active Chat / Conversation Area'}</div>
              <div className="panel-actions">{selected && <button className="ghost-btn">⋯</button>}</div>
            </div>
            <div className="panel-body panel-body-right">
              {!selected && <div className="messages-empty">Select a conversation from the list or start a new one</div>}
              {selected && (
                <>
                <div className="thread-panel">
                  <div className="thread-top">
                    <div className="thread-top-left">
                      <div className="avatar large">{initialsFromTitle(selected.title)}</div>
                      <div className="thread-top-meta">
                        <div className="thread-title">{selected.title || 'Conversation'}</div>
                        <div className="thread-sub">Online / last seen recently</div>
                      </div>
                    </div>
                    <div className="thread-top-right">
                    </div>
                  </div>

                  <div className="thread-body" ref={threadRef}>
                    {messages.map(m => (
                      <div key={m._id} className={`thread-msg ${m.from === userId ? 'me' : 'them'}`}>
                        <div className="msg-body">{m.body}</div>
                        <div className="msg-meta">{new Date(m.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                    <div className="typing-indicator">Typing…</div>
                  </div>

                </div>
                <div className="thread-input">
                  <div className="input-tools">
                    <button className="tool" aria-label="Attach">📎</button>
                    <button className="tool" aria-label="Emoji">😊</button>
                    <button className="tool" aria-label="Voice">🎤</button>
                  </div>
                  <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }} />
                  <button className="send-btn" onClick={handleSend} aria-label="Send">➤</button>
                </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <div className="wc-modal-overlay" role="dialog" aria-modal="true">
          <div className="wc-modal">
            <div className="wc-modal-header">
              <div>Delete chat</div>
              <button className="wc-modal-close" aria-label="Close" onClick={closeDeleteModal}>✕</button>
            </div>
            <div className="wc-modal-body">
              {deleteTarget?.title && <div style={{ fontWeight:700, marginBottom:8 }}>{deleteTarget.title}</div>}
              <div>Once you delete your copy of this conversation, it cannot be undone.</div>
            </div>
            <div className="wc-modal-actions">
              <button className="wc-btn wc-btn-cancel" onClick={closeDeleteModal}>Cancel</button>
              <button className="wc-btn wc-btn-danger" onClick={async () => { if (deleteTarget) { await handleDeleteConvo(deleteTarget.id); closeDeleteModal(); } }}>Delete chat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
