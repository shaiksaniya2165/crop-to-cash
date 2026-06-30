import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// TIME AGO
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(date, lang) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)  return lang === 'te' ? 'ఇప్పుడే' : 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)  return lang === 'te' ? `${m} నిమి క్రితం` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return lang === 'te' ? `${h} గం క్రితం` : `${h}h ago`;
  return lang === 'te' ? `${Math.floor(h / 24)} రోజుల క్రితం` : `${Math.floor(h / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reply Box (text only)
// ─────────────────────────────────────────────────────────────────────────────
function ReplyBox({ postId, lang, onReply }) {
  const [text, setText] = useState('');

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onReply(postId, trimmed);
    setText('');
  };

  return (
    <div style={{ marginTop: '0.75rem', background: '#f0fdf4', borderRadius: 12, padding: '0.75rem', border: '1px solid #bbf7d0' }}>
      <div style={{ fontSize: '0.74rem', color: 'var(--green-dark)', fontWeight: 700, marginBottom: '0.5rem' }}>
        💬 {lang === 'te' ? 'సమాధానం ఇవ్వండి' : 'Write a Reply'}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <textarea
          className="form-input"
          rows={2}
          style={{ flex: 1, padding: '8px 12px', resize: 'none', fontSize: '0.9rem' }}
          placeholder={lang === 'te' ? 'ఇక్కడ రాయండి...' : 'Type your reply here...'}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={!text.trim()} style={{ alignSelf: 'flex-end', height: 38 }}>
          {lang === 'te' ? '➤ పంపు' : '➤ Send'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CAT_COLORS = { pest:'#fef3c7', disease:'#fee2e2', weather:'#dbeafe', market:'#d1fae5', general:'#f3f4f6' };
const CAT_TEXT   = { pest:'#92400e', disease:'#991b1b', weather:'#1e40af', market:'#065f46', general:'#374151' };
const CAT_ICONS  = { pest:'🐛', disease:'🌿', weather:'🌤️', market:'💰', general:'💬' };

export default function Community() {
  const [posts,           setPosts]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showForm,        setShowForm]        = useState(false);
  const [form,            setForm]            = useState({ title: '', content: '', category: 'general' });
  const [expandedReplies, setExpandedReplies] = useState({});
  const [activeFilter,    setActiveFilter]    = useState('all');
  const [submitting,      setSubmitting]      = useState(false);
  const [flashMsg,        setFlashMsg]        = useState('');
  const { user }    = useAuth();
  const { t, lang } = useLang();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await API.get('/community');
      setPosts(data);
    } catch {}
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await API.post('/community', {
        ...form,
        village: user?.village,
        lang: 'te',
        titleEN: form.title, titleTE: form.title,
        contentEN: form.content, contentTE: form.content,
      });
      setForm({ title: '', content: '', category: 'general' });
      setShowForm(false);
      setFlashMsg(lang === 'te' ? '✅ మీ ప్రశ్న పోస్ట్ చేయబడింది! రైతులు త్వరలో సమాధానం ఇస్తారు.' : '✅ Posted! Farmers will reply soon.');
      fetchPosts();
      setTimeout(() => setFlashMsg(''), 4000);
    } catch {
      setFlashMsg('❌ ' + (lang === 'te' ? 'పోస్ట్ చేయడం విఫలమైంది.' : 'Post failed. Try again.'));
    }
    setSubmitting(false);
  };

  const handleReply = async (postId, text) => {
    if (!text.trim()) return;
    await API.post(`/community/${postId}/reply`, { text });
    fetchPosts();
  };

  const handleLike = async (postId) => {
    await API.put(`/community/${postId}/like`);
    fetchPosts();
  };

  const categories = ['all', 'pest', 'disease', 'weather', 'market', 'general'];
  const filtered   = activeFilter === 'all' ? posts : posts.filter(p => p.category === activeFilter);

  return (
    <div className="page">

      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">👥 {t('community')}</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            {lang === 'te'
              ? 'రైతులతో మాట్లాడండి — మీ ప్రశ్నలు పోస్ట్ చేయండి!'
              : 'Connect with farmers — post your questions!'}
          </p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? `✕ ${t('cancel')}` : `+ ${t('postQuestion')}`}
          </button>
        )}
      </div>

      {flashMsg && (
        <div className={`alert ${flashMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
          {flashMsg}
        </div>
      )}

      {/* ── Post Form ── */}
      {showForm && user && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--green-mid)', borderRadius: 18 }}>
          <form onSubmit={handlePost}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                📌 {lang === 'te' ? 'ప్రశ్న శీర్షిక' : 'Question Title'}
                <span style={{ color: '#9ca3af', fontSize: '0.72rem', marginLeft: 6 }}>
                  {lang === 'te' ? '(తెలుగులో రాయండి)' : '(type in Telugu)'}
                </span>
              </label>
              <input
                className="form-input"
                placeholder={lang === 'te' ? 'ఉదా: నా పత్తి పంటలో పురుగులు వస్తున్నాయి...' : 'e.g: నా పంటలో సమస్య వచ్చింది...'}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div className="form-group">
              <label className="form-label">
                📝 {lang === 'te' ? 'వివరంగా చెప్పండి' : 'Describe in detail'}
              </label>
              <textarea
                className="form-input"
                style={{ resize: 'none' }}
                rows={4}
                placeholder={lang === 'te'
                  ? 'ఉదా: ఆకులు పసుపు రంగులో మారుతున్నాయి, పురుగులు కనిపిస్తున్నాయి...'
                  : 'e.g: Leaves are turning yellow, pests visible...'}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
              {form.content && (
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 3 }}>
                  {form.content.length} {lang === 'te' ? 'అక్షరాలు' : 'chars'}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">{t('category')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['general','pest','disease','weather','market'].map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    style={{
                      padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                      border: `2px solid ${form.category === cat ? 'var(--green-mid)' : '#e0ece4'}`,
                      background: form.category === cat ? 'var(--surface)' : 'white',
                      color: form.category === cat ? 'var(--green-dark)' : 'var(--text-mid)',
                      transition: 'all 0.18s'
                    }}>
                    {CAT_ICONS[cat]} {t(cat)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary"
                disabled={submitting || !form.title.trim() || !form.content.trim()}>
                {submitting ? '...' : `📤 ${t('submit')}`}
              </button>
              <button type="button" className="btn btn-outline"
                onClick={() => { setShowForm(false); setForm({ title:'', content:'', category:'general' }); }}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)}
            style={{
              padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
              background: activeFilter === cat ? 'var(--green-mid)' : 'white',
              color:      activeFilter === cat ? 'white' : 'var(--text-mid)',
              border: `1px solid ${activeFilter === cat ? 'var(--green-mid)' : '#e0ece4'}`,
              transition: 'all 0.18s'
            }}>
            {cat === 'all'
              ? (lang === 'te' ? '📋 అన్నీ' : '📋 All')
              : `${CAT_ICONS[cat]} ${t(cat)}`}
          </button>
        ))}
      </div>

      {/* ── Posts ── */}
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-title">{t('noPostsYet')}</div>
          {user && (
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}
              onClick={() => setShowForm(true)}>
              {lang === 'te' ? 'మొదట పోస్ట్ చేయండి' : 'Be the first to post'}
            </button>
          )}
        </div>
      ) : (
        filtered.map(post => (
          <div key={post._id} className="post-card">

            {/* Header */}
            <div className="post-header">
              <div className="post-user">
                <div className="user-avatar">{post.userName?.[0]?.toUpperCase() || 'F'}</div>
                <div>
                  <div className="post-user-name">{post.userName}</div>
                  <div className="post-user-village">📍 {post.village || (lang === 'te' ? 'తెలియదు' : 'Unknown')}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 600,
                  background: CAT_COLORS[post.category] || CAT_COLORS.general,
                  color:      CAT_TEXT[post.category]   || CAT_TEXT.general
                }}>
                  {CAT_ICONS[post.category]} {t(post.category)}
                </span>
                <span className="post-time">{timeAgo(post.createdAt, lang)}</span>
              </div>
            </div>

            {/* Body */}
            <div className="post-title">
              {lang === 'te' ? (post.titleTE   || post.title)   : (post.titleEN   || post.title)}
            </div>
            <div className="post-content">
              {lang === 'te' ? (post.contentTE || post.content) : (post.contentEN || post.content)}
            </div>

            {/* Actions */}
            <div className="post-actions">
              <button className="btn btn-outline btn-sm" onClick={() => handleLike(post._id)}>
                👍 {t('like')} {post.likes > 0 && `(${post.likes})`}
              </button>
              <button className="btn btn-outline btn-sm"
                onClick={() => setExpandedReplies(prev => ({ ...prev, [post._id]: !prev[post._id] }))}>
                💬 {t('viewReplies')} ({post.replies?.length || 0})
              </button>
            </div>

            {/* Replies */}
            {expandedReplies[post._id] && (
              <div className="reply-box">
                {post.replies?.length === 0 && (
                  <div style={{ textAlign:'center', color:'var(--text-light)', fontSize:'0.83rem', padding:'0.5rem' }}>
                    {lang === 'te' ? 'ఇంకా సమాధానాలు లేవు' : 'No replies yet'}
                  </div>
                )}

                {post.replies?.map((reply, i) => {
                  const name    = lang === 'te' ? (reply.userNameTE || reply.userName) : reply.userName;
                  const village = lang === 'te' ? (reply.villageTE  || reply.village)  : reply.village;
                  const text    = lang === 'te' ? (reply.textTE     || reply.text)     : (reply.textEN || reply.text);
                  return (
                    <div key={i} className="reply-item">
                      <div className="reply-avatar"
                        style={{ background: reply.isAutoReply
                          ? 'linear-gradient(135deg,var(--gold),#e8930a)'
                          : 'linear-gradient(135deg,var(--green-mid),var(--green-dark))' }}>
                        {name?.[0]?.toUpperCase() || 'F'}
                      </div>
                      <div className="reply-content">
                        <div className="reply-name">
                          {name}
                          {village && (
                            <span style={{ fontWeight:400, color:'var(--text-light)', fontSize:'0.71rem' }}> 📍 {village}</span>
                          )}
                          {reply.isAutoReply && (
                            <span style={{ background:'#fef9c3', color:'#854d0e', fontSize:'0.63rem',
                              fontWeight:700, padding:'1px 6px', borderRadius:20, marginLeft:5 }}>
                              🌾 {lang === 'te' ? 'అనుభవ రైతు' : 'Exp. Farmer'}
                            </span>
                          )}
                          <span style={{ fontWeight:400, color:'var(--text-light)', fontSize:'0.71rem' }}>
                            {' '}• {timeAgo(reply.createdAt, lang)}
                          </span>
                        </div>
                        <div className="reply-text">{text}</div>
                      </div>
                    </div>
                  );
                })}

                {user && <ReplyBox postId={post._id} lang={lang} onReply={handleReply} />}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
