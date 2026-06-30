import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

const STAGES = [
  { key: 'accepted',         label: 'Accepted',         labelTE: 'అంగీకరించారు',      icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'pending',          label: 'Pending Pickup',    labelTE: 'పికప్ పెండింగ్',    icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'out_for_delivery', label: 'Agent On Way',      labelTE: 'ఏజెంట్ వస్తున్నారు', icon: '🚚', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'delivered',        label: 'Crop Collected',    labelTE: 'పంట తీసుకున్నారు',  icon: '📦', color: '#10b981', bg: '#ecfdf5' },
  { key: 'completed',        label: 'Payment Done',      labelTE: 'చెల్లింపు పూర్తి',  icon: '💰', color: '#059669', bg: '#d1fae5' },
];

function StageTracker({ currentStage, lang }) {
  const idx = STAGES.findIndex(s => s.key === currentStage);
  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4, margin: '0.75rem 0' }}>
      {STAGES.map((stage, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <React.Fragment key={stage.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64, flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? stage.color : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
                boxShadow: active ? `0 0 0 5px ${stage.color}28` : 'none',
                border: active ? `3px solid ${stage.color}` : '3px solid transparent',
                transition: 'all 0.4s'
              }}>
                {done ? stage.icon : <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{i + 1}</span>}
              </div>
              <div style={{
                fontSize: '0.65rem', fontWeight: active ? 800 : 500,
                color: done ? stage.color : '#9ca3af',
                marginTop: 4, textAlign: 'center', lineHeight: 1.2
              }}>
                {lang === 'te' ? stage.labelTE : stage.label}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ height: 3, flex: 1, minWidth: 12, background: i < idx ? STAGES[i].color : '#e5e7eb', transition: 'all 0.4s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function UserChatBox({ request, userName, onSend, lang }) {
  const [text, setText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request?.messages]);

  const send = async () => {
    if (!text.trim()) return;
    await onSend(request._id, text);
    setText('');
  };

  return (
    <div style={{ border: '1px solid #e0ece4', borderRadius: 14, overflow: 'hidden', marginTop: '1rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1rem' }}>💬</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>
          {lang === 'te' ? 'అడ్మిన్‌తో సందేశాలు' : 'Messages with Admin'}
        </span>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20 }}>
          {request.adminName}
        </span>
      </div>
      <div style={{ height: 200, overflowY: 'auto', padding: '12px', background: '#f0f7ff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(!request.messages || request.messages.length === 0) && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', margin: 'auto' }}>
            {lang === 'te' ? 'సందేశాలు లేవు' : 'No messages yet'}
          </div>
        )}
        {request.messages?.map((msg, i) => {
          const isAdmin = msg.sender === 'admin';
          const displayText = lang === 'te' ? (msg.textTE || msg.text) : (msg.textEN || msg.text);
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-start' : 'flex-end' }}>
              <div style={{
                maxWidth: '82%', padding: '8px 12px',
                borderRadius: isAdmin ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                background: isAdmin ? 'white' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: isAdmin ? 'var(--text-dark)' : 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                border: isAdmin ? '1px solid #dbeafe' : 'none'
              }}>
                <div style={{ fontSize: '0.68rem', opacity: 0.7, marginBottom: 2, fontWeight: 600 }}>
                  {isAdmin ? `🏛️ ${msg.senderName}` : `🧑‍🌾 ${msg.senderName}`}
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>{displayText}</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.6, marginTop: 3, textAlign: isAdmin ? 'left' : 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '10px', borderTop: '1px solid #e0ece4', background: 'white' }}>
        <input
          style={{ flex: 1, border: '1px solid #dbeafe', borderRadius: 20, padding: '8px 14px', fontFamily: 'inherit', fontSize: '0.87rem', outline: 'none' }}
          placeholder={lang === 'te' ? 'అడ్మిన్‌కు సందేశం రాయండి...' : 'Message the admin...'}
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white',
          border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem'
        }}>
          {lang === 'te' ? 'పంపు' : 'Send'} ➤
        </button>
      </div>
    </div>
  );
}

function ProfitBadge({ request, lang }) {
  const offered = request.price || 0;
  const market = request.marketRate || 0;
  const qty = request.quantityKg || 0;
  if (!offered || !qty) return null;

  const earns = offered * qty;
  const marketVal = market * qty;
  const extra = earns - marketVal;
  const pct = marketVal > 0 ? (((earns - marketVal) / marketVal) * 100).toFixed(1) : 0;
  const isGain = earns >= marketVal;

  return (
    <div style={{
      background: isGain ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #fff7ed, #fed7aa)',
      border: `1px solid ${isGain ? '#86efac' : '#fdba74'}`,
      borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isGain ? '#15803d' : '#9a3412' }}>
          💹 {lang === 'te' ? 'మీ లాభం లెక్క' : 'Your Earnings Breakdown'}
        </span>
        <span style={{
          background: isGain ? '#15803d' : '#dc2626', color: 'white',
          borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 800
        }}>{isGain ? '+' : ''}{pct}% {lang === 'te' ? 'మార్కెట్ కంటే' : 'vs Market'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
        {[
          { l: lang === 'te' ? 'ఆఫర్ ధర' : 'Offered', v: `₹${offered}/kg`, c: '#059669' },
          { l: lang === 'te' ? 'మొత్తం బరువు' : 'Total Weight', v: `${qty} kg`, c: '#1e40af' },
          { l: lang === 'te' ? 'మీరు పొందేది' : 'You Receive', v: `₹${earns.toLocaleString('en-IN')}`, c: isGain ? '#059669' : '#dc2626' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '5px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>{item.l}</div>
            <div style={{ fontWeight: 800, color: item.c, fontSize: '0.88rem' }}>{item.v}</div>
          </div>
        ))}
      </div>
      {extra !== 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: isGain ? '#15803d' : '#9a3412', textAlign: 'center' }}>
          {isGain ? '📈 Extra profit vs market: ' : '📉 Below market by: '}₹{Math.abs(extra).toLocaleString('en-IN')}
        </div>
      )}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#059669', marginTop: '0.4rem', fontWeight: 700 }}>
        🚪 {lang === 'te' ? 'డోర్ పికప్ — ట్రాన్స్‌పోర్ట్ ఖర్చు లేదు!' : 'Door Pickup — Zero transport cost for you!'}
      </div>
    </div>
  );
}

export default function Requests() {
  const [allRequests, setAllRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('browse');
  const [acceptModal, setAcceptModal] = useState({ show: false, req: null });
  const [acceptForm, setAcceptForm] = useState({ mobile: '', address: '', village: '', district: '', pincode: '', landmarkNote: '' });
  const [selectedMyReq, setSelectedMyReq] = useState(null);
  const [msg, setMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('open');
  const { user, token } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [all, mine] = await Promise.all([
        API.get('/requests'),
        token ? API.get('/requests/user/mine') : Promise.resolve({ data: [] })
      ]);
      setAllRequests(all.data);
      setMyRequests(mine.data);
      if (selectedMyReq) setSelectedMyReq(mine.data.find(r => r._id === selectedMyReq._id) || null);
    } catch {}
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!acceptForm.mobile || !acceptForm.address) { setMsg('Please fill mobile and address'); return; }
    try {
      await API.put(`/requests/${acceptModal.req._id}/accept`, { ...acceptForm });
      setAcceptModal({ show: false, req: null });
      setAcceptForm({ mobile: '', address: '', village: '', district: '', pincode: '', landmarkNote: '' });
      setMsg('✅ ' + (lang === 'te' ? 'విజయవంతంగా అంగీకరించారు! అడ్మిన్ త్వరలో సంప్రదిస్తారు.' : 'Accepted! Admin will contact you soon.'));
      setTab('my');
      fetchAll();
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  const handleUserMessage = async (reqId, text) => {
    await API.post(`/requests/${reqId}/user-message`, { text });
    fetchAll();
  };

  const openRequests = allRequests.filter(r => r.status === 'open');
  const stageInfo = (stage) => STAGES.find(s => s.key === stage);

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--cream)' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 50%, #f5a623 150%)',
        padding: '2rem 2rem 1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")', opacity: 0.6 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            🛒 {lang === 'te' ? 'మార్కెట్ అభ్యర్థనలు' : 'Market Requests'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'te'
              ? 'అడ్మిన్ అభ్యర్థనలు అంగీకరించండి — డోర్ పికప్, నేరుగా మీ ఇంటి నుండి అధిక ధర పొందండి!'
              : 'Accept admin requests — door pickup from your farm, earn more than market rate!'}
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { n: openRequests.length, l: lang === 'te' ? 'అందుబాటులో' : 'Available', icon: '📋' },
              { n: myRequests.filter(r => ['accepted', 'pending_pickup', 'out_for_delivery'].includes(r.status)).length, l: lang === 'te' ? 'యాక్టివ్' : 'Active', icon: '🚚' },
              { n: myRequests.filter(r => r.status === 'completed').length, l: lang === 'te' ? 'పూర్తయిన' : 'Completed', icon: '✅' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 14px' }}>
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                <div>
                  <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {msg && (
          <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: 'white', borderRadius: 14, padding: 5, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', width: 'fit-content' }}>
          {[
            { key: 'browse', label: lang === 'te' ? '📋 అభ్యర్థనలు' : '📋 Browse Requests', count: openRequests.length },
            { key: 'my', label: lang === 'te' ? '🧑‍🌾 నా డీల్స్' : '🧑‍🌾 My Deals', count: myRequests.length },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '0.88rem',
                background: tab === tb.key ? 'linear-gradient(135deg, var(--green-dark), var(--green-mid))' : 'transparent',
                color: tab === tb.key ? 'white' : 'var(--text-mid)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
              {tb.label}
              <span style={{
                background: tab === tb.key ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                color: tab === tb.key ? 'white' : 'var(--green-mid)',
                borderRadius: 20, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 800
              }}>{tb.count}</span>
            </button>
          ))}
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : (

          /* ═══ BROWSE TAB ═══ */
          tab === 'browse' ? (
            <>
              {/* Filter */}
              <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['open', 'all'].map(f => (
                  <button key={f} onClick={() => setFilterStatus(f)}
                    style={{
                      padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
                      background: filterStatus === f ? 'var(--green-mid)' : 'white',
                      color: filterStatus === f ? 'white' : 'var(--text-mid)',
                      border: `1px solid ${filterStatus === f ? 'var(--green-mid)' : '#e0ece4'}`
                    }}>
                    {f === 'open' ? (lang === 'te' ? '🟢 అందుబాటులో' : '🟢 Available') : (lang === 'te' ? 'అన్నీ' : 'All')}
                    {' '}({(filterStatus === f || f === 'all' ? allRequests : openRequests).length})
                  </button>
                ))}
              </div>

              {(filterStatus === 'open' ? openRequests : allRequests).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">{lang === 'te' ? 'ఇప్పుడు అభ్యర్థనలు లేవు' : 'No requests available now'}</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {(filterStatus === 'open' ? openRequests : allRequests).map(req => (
                    <div key={req._id} style={{
                      background: 'white', borderRadius: 16, overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      border: '1px solid #e8f5ee',
                      transition: 'all 0.25s'
                    }}>
                      {/* Card top accent */}
                      <div style={{ height: 5, background: 'linear-gradient(90deg, var(--green-mid), var(--gold))' }} />
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--green-dark)' }}>
                              🌾 {lang === 'te' ? (req.cropNameTE || req.cropName) : req.cropName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2 }}>
                              {lang === 'te' ? 'పోస్ట్ చేసినది' : 'By'}: {req.adminName} · {new Date(req.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                          <span style={{
                            background: req.status === 'open' ? '#dcfce7' : '#f3f4f6',
                            color: req.status === 'open' ? '#15803d' : '#6b7280',
                            fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, height: 'fit-content'
                          }}>
                            {req.status === 'open' ? '🟢 OPEN' : req.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {[
                            { icon: '📦', l: t('quantity'), v: req.quantity },
                            { icon: '💰', l: t('price'), v: `₹${req.price}/${req.unit}` },
                            { icon: '⚖️', l: 'Total KG', v: req.quantityKg ? `${req.quantityKg} kg` : '—' },
                            { icon: '🚪', l: 'Pickup', v: req.deliveryType === 'door' ? 'Door Pickup' : 'You Deliver' },
                          ].map((d, i) => (
                            <div key={i} style={{ background: 'var(--surface)', borderRadius: 8, padding: '6px 10px' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>{d.icon} {d.l}</div>
                              <div style={{ fontWeight: 700, color: 'var(--green-dark)', fontSize: '0.88rem' }}>{d.v}</div>
                            </div>
                          ))}
                        </div>

                        {/* Profit preview */}
                        {req.price && req.quantityKg && req.marketRate && (
                          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '7px 10px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                              💹 {lang === 'te' ? 'మీరు పొందేది' : 'You earn'}: ₹{(req.price * req.quantityKg).toLocaleString('en-IN')}
                            </span>
                            {req.marketRate > 0 && (
                              <span style={{ background: '#15803d', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 800 }}>
                                +{(((req.price - req.marketRate) / req.marketRate) * 100).toFixed(0)}% vs mkt
                              </span>
                            )}
                          </div>
                        )}

                        {req.description && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: '0.75rem', lineHeight: 1.5, borderLeft: '3px solid var(--green-light)', paddingLeft: 8 }}>
                            {req.description}
                          </p>
                        )}

                        {req.status === 'open' && user ? (
                          <button className="btn btn-gold btn-full"
                            onClick={() => {
                              setAcceptModal({ show: true, req });
                              setAcceptForm({ mobile: user?.mobile || '', village: user?.village || '', district: user?.district || '', address: '', pincode: '', landmarkNote: '' });
                            }}>
                            🤝 {lang === 'te' ? 'అంగీకరించి పికప్ బుక్ చేయండి' : 'Accept & Book Door Pickup'}
                          </button>
                        ) : req.status !== 'open' ? (
                          <div style={{ textAlign: 'center', padding: '8px', background: '#f3f4f6', borderRadius: 8, fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                            {req.status.replace(/_/g, ' ').toUpperCase()}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '8px', background: '#fef9c3', borderRadius: 8, fontSize: '0.82rem', color: '#854d0e', fontWeight: 600 }}>
                            {lang === 'te' ? 'అంగీకరించడానికి లాగిన్ చేయండి' : 'Login to accept'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (

            /* ═══ MY DEALS TAB ═══ */
            <div style={{ display: 'grid', gridTemplateColumns: selectedMyReq ? '380px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

              {/* Left: my requests list */}
              <div>
                {myRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🤝</div>
                    <div className="empty-title">{lang === 'te' ? 'ఇంకా అంగీకరించిన అభ్యర్థనలు లేవు' : 'No accepted requests yet'}</div>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setTab('browse')}>
                      📋 {lang === 'te' ? 'అభ్యర్థనలు చూడండి' : 'Browse Requests'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myRequests.map(req => {
                      const si = stageInfo(req.deliveryStage);
                      const isSelected = selectedMyReq?._id === req._id;
                      const unread = req.messages?.filter(m => m.sender === 'admin').length || 0;
                      return (
                        <div key={req._id}
                          onClick={() => setSelectedMyReq(isSelected ? null : req)}
                          style={{
                            background: isSelected ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'white',
                            borderRadius: 14, padding: '1rem', cursor: 'pointer',
                            border: `2px solid ${isSelected ? 'var(--green-mid)' : '#e8f5ee'}`,
                            boxShadow: isSelected ? '0 4px 16px rgba(45,122,79,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s',
                            borderLeft: `5px solid ${si?.color || 'var(--green-mid)'}`
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--green-dark)' }}>
                                🌾 {lang === 'te' ? (req.cropNameTE || req.cropName) : req.cropName}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2 }}>
                                💰 ₹{req.price}/{req.unit} · 📦 {req.quantity}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                              {si && (
                                <span style={{ background: si.bg, color: si.color, fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                                  {si.icon} {lang === 'te' ? si.labelTE : si.label}
                                </span>
                              )}
                              {unread > 0 && (
                                <span style={{ background: '#ef4444', color: 'white', borderRadius: 20, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800 }}>
                                  💬 {unread}
                                </span>
                              )}
                            </div>
                          </div>
                          {req.deliveryStage && <StageTracker currentStage={req.deliveryStage} lang={lang} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: selected deal detail */}
              {selectedMyReq && (
                <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e8f5ee', position: 'sticky', top: 80 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--green-dark)', fontWeight: 800, fontSize: '1.1rem' }}>
                      🌾 {lang === 'te' ? (selectedMyReq.cropNameTE || selectedMyReq.cropName) : selectedMyReq.cropName}
                    </h3>
                    <button onClick={() => setSelectedMyReq(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                  </div>

                  {/* Stage tracker */}
                  {selectedMyReq.deliveryStage && <StageTracker currentStage={selectedMyReq.deliveryStage} lang={lang} />}

                  {/* Current stage callout */}
                  {stageInfo(selectedMyReq.deliveryStage) && (() => {
                    const si = stageInfo(selectedMyReq.deliveryStage);
                    const msgs = {
                      accepted: lang === 'te' ? '✅ మీ అభ్యర్థన అంగీకరించబడింది! అడ్మిన్ త్వరలో మీతో సంప్రదిస్తారు.' : '✅ Your request accepted! Admin will contact you shortly.',
                      pending: lang === 'te' ? '⏳ పికప్ షెడ్యూల్ చేయబడింది. పంటను సిద్ధంగా ఉంచండి!' : '⏳ Pickup scheduled. Please keep your crop ready!',
                      out_for_delivery: lang === 'te' ? '🚚 మా ఏజెంట్ మీ వైపు వస్తున్నారు! దయచేసి అందుబాటులో ఉండండి.' : '🚚 Our agent is on the way to you! Please be available.',
                      delivered: lang === 'te' ? '📦 పంట సేకరించారు! 24 గంటల్లో చెల్లింపు జరుగుతుంది.' : '📦 Crop collected! Payment will arrive in 24 hours.',
                      completed: lang === 'te' ? '🎉 లావాదేవీ పూర్తయింది! చెల్లింపు జరిగింది. ధన్యవాదాలు!' : '🎉 Transaction complete! Payment processed. Thank you!'
                    };
                    return (
                      <div style={{ background: si.bg, border: `1px solid ${si.color}40`, borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: '1.3rem' }}>{si.icon}</span>
                        <span style={{ fontSize: '0.85rem', color: si.color, fontWeight: 600, lineHeight: 1.4 }}>
                          {msgs[selectedMyReq.deliveryStage]}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Delivery agent info if out for delivery */}
                  {selectedMyReq.deliveryAgent && (
                    <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: '8px 12px', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700 }}>
                        👤 {lang === 'te' ? 'డెలివరీ ఏజెంట్' : 'Delivery Agent'}: {selectedMyReq.deliveryAgent}
                      </span>
                    </div>
                  )}

                  {/* Profit breakdown */}
                  <ProfitBadge request={selectedMyReq} lang={lang} />

                  {/* Admin contact */}
                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#6d28d9', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      🏛️ {lang === 'te' ? 'అడ్మిన్ సంప్రదింపు' : 'Admin Contact'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#4c1d95' }}>
                      👤 {selectedMyReq.adminName}
                      <span style={{ margin: '0 8px' }}>·</span>
                      📱 <a href={`tel:${selectedMyReq.adminMobile}`} style={{ color: '#7c3aed', fontWeight: 700 }}>{selectedMyReq.adminMobile}</a>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: '0.5rem' }}>
                      <a href={`tel:${selectedMyReq.adminMobile}`} className="btn btn-sm" style={{ background: '#7c3aed', color: 'white', textDecoration: 'none', flex: 1, textAlign: 'center' }}>
                        📞 {lang === 'te' ? 'కాల్ చేయండి' : 'Call Admin'}
                      </a>
                      <a href={(() => {
                          const crop = lang === 'te' ? (selectedMyReq.cropNameTE || selectedMyReq.cropName) : selectedMyReq.cropName;
                          const msgEN = `Hello ${selectedMyReq.adminName}! 🙏 I am ${user?.name} from ${user?.village || 'my village'}. I accepted your *${crop}* request. Please arrange pickup at your earliest convenience. My address: ${selectedMyReq.acceptedBy?.address}. Thank you!`;
                          const msgTE = `నమస్కారం ${selectedMyReq.adminName}! 🙏 నేను ${user?.name}, ${user?.village || 'మా గ్రామం'} నుండి. మీ *${crop}* అభ్యర్థన అంగీకరించాను. దయచేసి పికప్ ఏర్పాటు చేయండి. నా చిరునామా: ${selectedMyReq.acceptedBy?.address}. ధన్యవాదాలు!`;
                          return `https://wa.me/91${selectedMyReq.adminMobile}?text=${encodeURIComponent(lang === 'te' ? msgTE : msgEN)}`;
                        })()}
                        target="_blank" rel="noreferrer" className="btn btn-sm"
                        style={{ background: '#25D366', color: 'white', textDecoration: 'none', flex: 1, textAlign: 'center' }}>
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Stage history */}
                  {selectedMyReq.stageHistory?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--green-dark)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        📜 {lang === 'te' ? 'అప్‌డేట్ చరిత్ర' : 'Update History'}
                      </div>
                      <div style={{ borderLeft: '2px solid #e0ece4', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {selectedMyReq.stageHistory.map((h, i) => {
                          const si = stageInfo(h.stage);
                          return (
                            <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-mid)', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: -17, top: 3, width: 10, height: 10, borderRadius: '50%', background: si?.color || 'var(--green-mid)' }} />
                              <strong style={{ color: si?.color || 'var(--green-dark)' }}>{si?.icon} {lang === 'te' ? si?.labelTE : si?.label || h.stage}</strong>
                              {(h.noteTE || h.noteEN || h.note) && (
                                <span style={{ marginLeft: 4 }}>
                                  — {lang === 'te' ? (h.noteTE || h.note) : (h.noteEN || h.note)}
                                </span>
                              )}
                              <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                                {new Date(h.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Chat */}
                  <UserChatBox request={selectedMyReq} userName={user?.name} onSend={handleUserMessage} lang={lang} />
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* ═══ ACCEPT MODAL ═══ */}
      {acceptModal.show && (
        <div className="modal-overlay" onClick={() => setAcceptModal({ show: false, req: null })}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ color: 'var(--green-dark)', fontWeight: 800 }}>
                🚪 {lang === 'te' ? 'డోర్ పికప్ బుక్ చేయండి' : 'Book Door Pickup'}
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                {lang === 'te'
                  ? 'మీ వివరాలు ఇవ్వండి — మేము మీ వద్దకే వస్తాం!'
                  : 'Give your details — we come to you for FREE pickup!'}
              </p>
            </div>

            {/* Crop summary */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--green-dark)' }}>🌾 {lang === 'te' ? (acceptModal.req?.cropNameTE || acceptModal.req?.cropName) : acceptModal.req?.cropName}</div>
                <div style={{ fontSize: '0.82rem', color: '#059669' }}>💰 ₹{acceptModal.req?.price}/{acceptModal.req?.unit} · 📦 {acceptModal.req?.quantity}</div>
              </div>
              {acceptModal.req?.quantityKg && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                    ₹{(acceptModal.req.price * acceptModal.req.quantityKg).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{lang === 'te' ? 'మీరు సంపాదించేది' : 'You earn'}</div>
                </div>
              )}
            </div>

            {msg && !msg.includes('✅') && <div className="alert alert-error">{msg}</div>}

            <div className="form-group">
              <label className="form-label">📱 {t('mobileNumber')} *</label>
              <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile"
                value={acceptForm.mobile} onChange={e => setAcceptForm({ ...acceptForm, mobile: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🏘️ {t('village')} *</label>
                <input className="form-input" placeholder="Village"
                  value={acceptForm.village} onChange={e => setAcceptForm({ ...acceptForm, village: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🗺️ {t('district')}</label>
                <input className="form-input" placeholder="District"
                  value={acceptForm.district} onChange={e => setAcceptForm({ ...acceptForm, district: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">📮 Pincode</label>
                <input className="form-input" maxLength={6} placeholder="6-digit pincode"
                  value={acceptForm.pincode} onChange={e => setAcceptForm({ ...acceptForm, pincode: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🗺️ Landmark</label>
                <input className="form-input" placeholder="Near school / temple..."
                  value={acceptForm.landmarkNote} onChange={e => setAcceptForm({ ...acceptForm, landmarkNote: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🏠 {t('address')} *</label>
              <textarea className="form-input" rows={2} placeholder={lang === 'te' ? 'పూర్తి చిరునామా — పంట పికప్ కు...' : 'Full address for crop pickup...'}
                value={acceptForm.address} onChange={e => setAcceptForm({ ...acceptForm, address: e.target.value })} />
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
              ℹ️ {lang === 'te' ? 'అడ్మిన్ మీతో సంప్రదిస్తారు మరియు మీ వద్దకే వచ్చి పంట తీసుకుంటారు. రవాణా ఖర్చు మీది కాదు!' : 'Admin will contact you & come to your address for crop pickup. No transport cost for you!'}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleAccept}>
                🤝 {lang === 'te' ? 'నిర్ధారించి పికప్ బుక్ చేయండి' : 'Confirm & Book Pickup'}
              </button>
              <button className="btn btn-outline" onClick={() => setAcceptModal({ show: false, req: null })}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
