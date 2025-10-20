import React, { useEffect, useState, useRef } from 'react';
import './Messages.css';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, getMessages, sendMessage } from '../../api/messages';

function initialsFromTitle(title) {
  if (!title) return 'U';
  const parts = title.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Messages() {
  const { profile } = useAuth();
  const userId = profile?.userId || profile?._id || null;
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const threadRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    getConversations(userId).then(d => setConvos(d.conversations || [])).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!selected) return;
    getMessages(selected._id).then(d => setMessages(d.messages || [])).catch(() => {});
  }, [selected]);

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
      const c = await getConversations(userId);
      setConvos(c.conversations || []);
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="messages-thread">
          <div className="panel panel-right">
            <div className="panel-header">
              <div className="panel-title">{selected ? (selected.title || 'Conversation') : 'Active Chat / Conversation Area'}</div>
              <div className="panel-actions">{selected && <button className="ghost-btn">⋯</button>}</div>
            </div>
            <div className="panel-body panel-body-right">
              {!selected && <div className="messages-empty">Select a conversation from the list or start a new one</div>}
              {selected && (
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

                  <div className="thread-input">
                    <div className="input-tools">
                      <button className="tool" aria-label="Attach">📎</button>
                      <button className="tool" aria-label="Emoji">😊</button>
                      <button className="tool" aria-label="Voice">🎤</button>
                    </div>
                    <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" />
                    <button className="send-btn" onClick={handleSend} aria-label="Send">➤</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
