import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

const CROP_OPTIONS = [
  { name: 'Rice', nameTE: 'వరి', icon: '🌾' },
  { name: 'Wheat', nameTE: 'గోధుమ', icon: '🌿' },
  { name: 'Cotton', nameTE: 'పత్తి', icon: '☁️' },
  { name: 'Sugarcane', nameTE: 'చెరకు', icon: '🌱' },
  { name: 'Maize', nameTE: 'మొక్కజొన్న', icon: '🌽' },
  { name: 'Groundnut', nameTE: 'వేరుశెనగ', icon: '🥜' },
  { name: 'Sunflower', nameTE: 'పొద్దుతిరుగుడు', icon: '🌻' },
  { name: 'Soybean', nameTE: 'సోయాబీన్', icon: '🫘' },
  { name: 'Tomato', nameTE: 'టమాటా', icon: '🍅' },
  { name: 'Onion', nameTE: 'ఉల్లి', icon: '🧅' },
  { name: 'Chili', nameTE: 'మిర్చి', icon: '🌶️' },
  { name: 'Turmeric', nameTE: 'పసుపు', icon: '🟡' },
];

const STAGES = [
  { key: 'accepted',         label: 'Accepted',          labelTE: 'అంగీకరించారు',      icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'pending',          label: 'Pending Pickup',     labelTE: 'పికప్ పెండింగ్',    icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   labelTE: 'డెలివరీలో ఉంది',   icon: '🚚', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'delivered',        label: 'Crop Collected',     labelTE: 'పంట సేకరించారు',   icon: '📦', color: '#10b981', bg: '#ecfdf5' },
  { key: 'completed',        label: 'Payment Done',       labelTE: 'చెల్లింపు పూర్తి', icon: '💰', color: '#059669', bg: '#d1fae5' },
];

function StageTracker({ currentStage, lang }) {
  const idx = STAGES.findIndex(s => s.key === currentStage);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '1rem 0', overflowX: 'auto', paddingBottom: 4 }}>
      {STAGES.map((stage, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <React.Fragment key={stage.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72, flex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: done ? stage.color : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: active ? `0 0 0 4px ${stage.color}33` : 'none',
                transition: 'all 0.3s',
                border: active ? `3px solid ${stage.color}` : '3px solid transparent'
              }}>{done ? stage.icon : <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{i + 1}</span>}</div>
              <div style={{
                fontSize: '0.68rem', fontWeight: active ? 700 : 500,
                color: done ? stage.color : '#9ca3af', marginTop: 4, textAlign: 'center', lineHeight: 1.2
              }}>
                {lang === 'te' ? stage.labelTE : stage.label}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ height: 3, flex: 1, background: i < idx ? STAGES[i].color : '#e5e7eb', minWidth: 16, transition: 'all 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ChatBox({ request, adminName, onSend, lang }) {
  const [text, setText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request?.messages]);

  const send = async () => {
    if (!text.trim()) return;
    await onSend(text);
    setText('');
  };

  return (
    <div style={{ border: '1px solid #e0ece4', borderRadius: 14, overflow: 'hidden', marginTop: '1rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>💬</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
          {lang === 'te' ? 'రైతుతో సందేశాలు' : 'Messages with Farmer'}
        </span>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20 }}>
          {request.acceptedBy?.userName}
        </span>
      </div>

      {/* Messages */}
      <div style={{ height: 220, overflowY: 'auto', padding: '12px', background: '#f8fdf9', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(!request.messages || request.messages.length === 0) && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', margin: 'auto' }}>
            {lang === 'te' ? 'ఇంకా సందేశాలు లేవు' : 'No messages yet'}
          </div>
        )}
        {request.messages?.map((msg, i) => {
          const isAdmin = msg.sender === 'admin';
          const displayText = lang === 'te' ? (msg.textTE || msg.text) : (msg.textEN || msg.text);
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '8px 12px', borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: isAdmin ? 'linear-gradient(135deg, var(--green-mid), var(--green-dark))' : 'white',
                color: isAdmin ? 'white' : 'var(--text-dark)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                border: isAdmin ? 'none' : '1px solid #e0ece4'
              }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginBottom: 2, fontWeight: 600 }}>
                  {isAdmin ? `🏛️ ${msg.senderName}` : `🧑‍🌾 ${msg.senderName}`}
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{displayText}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: 3, textAlign: isAdmin ? 'right' : 'left' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: '10px', borderTop: '1px solid #e0ece4', background: 'white' }}>
        <input
          style={{ flex: 1, border: '1px solid #e0ece4', borderRadius: 20, padding: '8px 14px', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none' }}
          placeholder={lang === 'te' ? 'రైతుకు సందేశం రాయండి...' : 'Type a message to farmer...'}
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} style={{
          background: 'linear-gradient(135deg, var(--green-mid), var(--green-dark))', color: 'white',
          border: 'none', borderRadius: 20, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem'
        }}>
          {lang === 'te' ? 'పంపు' : 'Send'} ➤
        </button>
      </div>
    </div>
  );
}

function ProfitCard({ request, lang }) {
  const p = request.profit;
  const marketRate = request.marketRate || 0;
  const offered = request.price || 0;
  const qty = request.quantityKg || 0;

  const farmerEarns = offered * qty;
  const marketValue = marketRate * qty;
  const farmerProfit = farmerEarns - marketValue;
  const profitPct = marketValue > 0 ? (((farmerEarns - marketValue) / marketValue) * 100).toFixed(1) : 0;
  const isProfit = farmerEarns >= marketValue;

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
      <h4 style={{ color: 'var(--green-dark)', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        💹 {lang === 'te' ? 'ఆదాయ లెక్క (రైతు)' : 'Farmer Profit Calculator'}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {[
          { label: lang === 'te' ? 'ఆఫర్ ధర' : 'Offered Price', val: `₹${offered}/kg`, color: 'var(--green-dark)' },
          { label: lang === 'te' ? 'మార్కెట్ రేటు' : 'Market Rate', val: `₹${marketRate.toFixed(1)}/kg`, color: '#64748b' },
          { label: lang === 'te' ? 'మొత్తం బరువు' : 'Total Qty', val: `${qty} kg`, color: '#1e40af' },
          { label: lang === 'te' ? 'రైతు సంపాదన' : 'Farmer Earns', val: `₹${farmerEarns.toLocaleString('en-IN')}`, color: '#059669' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 8, padding: '6px 10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{item.label}</div>
            <div style={{ fontWeight: 700, color: item.color, fontSize: '0.9rem' }}>{item.val}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.75rem', background: isProfit ? '#dcfce7' : '#fee2e2', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: isProfit ? '#15803d' : '#dc2626', fontSize: '0.9rem' }}>
          {isProfit ? '📈' : '📉'} {lang === 'te' ? 'అదనపు లాభం' : 'Extra vs Market'}:
          {' '}₹{Math.abs(farmerProfit).toLocaleString('en-IN')}
        </span>
        <span style={{ background: isProfit ? '#15803d' : '#dc2626', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
          {isProfit ? '+' : ''}{profitPct}%
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem', fontWeight: 600 }}>
        🚪 {lang === 'te' ? 'డోర్ పికప్ — రైతు రవాణా ఖర్చు లేదు!' : 'Door Pickup — Zero transport cost for farmer!'}
      </p>
    </div>
  );
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cropName: '', cropNameTE: '', quantity: '', quantityKg: '', price: '', unit: 'quintal', description: '', deliveryType: 'door' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [stageForm, setStageForm] = useState({ stage: '', note: '', deliveryAgent: '', deliveryDate: '' });
  const [showStageModal, setShowStageModal] = useState(false);
  const { admin } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const { data } = await API.get('/requests/admin/mine');
    setRequests(data);
    if (selected) setSelected(data.find(r => r._id === selected._id) || null);
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.cropName || !form.quantity || !form.price) { setMsg('Fill all required fields'); return; }
    try {
      await API.post('/requests', form);
      setForm({ cropName: '', cropNameTE: '', quantity: '', quantityKg: '', price: '', unit: 'quintal', description: '', deliveryType: 'door' });
      setShowForm(false);
      setMsg('✅ Request posted!');
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleStageUpdate = async () => {
    if (!stageForm.stage) return;
    await API.put(`/requests/${selected._id}/stage`, stageForm);
    setShowStageModal(false);
    setStageForm({ stage: '', note: '', deliveryAgent: '', deliveryDate: '' });
    fetchRequests();
  };

  const handleSendMessage = async (text) => {
    await API.post(`/requests/${selected._id}/message`, { text });
    fetchRequests();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    await API.delete(`/requests/${id}`);
    if (selected?._id === id) setSelected(null);
    fetchRequests();
  };

  const statusColors = { open: '#f59e0b', accepted: '#3b82f6', pending_pickup: '#f59e0b', out_for_delivery: '#8b5cf6', delivered: '#10b981', completed: '#059669', cancelled: '#ef4444' };
  const filtered = filter === 'all' ? requests : requests.filter(r =>
    filter === 'accepted_plus' ? ['accepted', 'pending_pickup', 'out_for_delivery', 'delivered'].includes(r.status) : r.status === filter
  );

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === 'open').length,
    active: requests.filter(r => ['accepted', 'pending_pickup', 'out_for_delivery', 'delivered'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalRevenue: requests.filter(r => r.profit).reduce((a, r) => a + (r.profit?.totalRevenue || 0), 0)
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: 'var(--cream)' }}>

      {/* ── LEFT PANEL ───────────────────────────────────────────── */}
      <div style={{ width: selected ? 420 : '100%', maxWidth: selected ? 420 : '100%', padding: '1.5rem', overflowY: 'auto', transition: 'all 0.3s', borderRight: selected ? '1px solid #e0ece4' : 'none' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-dark)' }}>📋 {lang === 'te' ? 'పంట అభ్యర్థనలు' : 'Crop Requests'}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: 2 }}>{lang === 'te' ? 'డోర్ పికప్ నిర్వహణ' : 'Door pickup management'}</p>
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : `+ ${lang === 'te' ? 'అభ్యర్థన పోస్ట్ చేయండి' : 'Post Request'}`}
          </button>
        </div>

        {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { n: stats.total, l: lang === 'te' ? 'మొత్తం' : 'Total', c: 'var(--green-dark)' },
            { n: stats.open, l: lang === 'te' ? 'తెరిచి' : 'Open', c: '#f59e0b' },
            { n: stats.active, l: lang === 'te' ? 'యాక్టివ్' : 'Active', c: '#3b82f6' },
            { n: stats.completed, l: lang === 'te' ? 'పూర్తి' : 'Done', c: '#059669' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, padding: '8px', textAlign: 'center', border: `2px solid ${s.c}22`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {stats.totalRevenue > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', borderRadius: 12, padding: '10px 14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>💰 {lang === 'te' ? 'మొత్తం రెవెన్యూ' : 'Total Revenue'}</span>
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* ── Post Request Form ── */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', border: '2px solid var(--gold)', boxShadow: '0 4px 20px rgba(245,166,35,0.15)' }}>
            <h3 style={{ color: 'var(--green-dark)', fontWeight: 800, marginBottom: '1rem' }}>🌾 {lang === 'te' ? 'కొత్త అభ్యర్థన' : 'New Crop Request'}</h3>
            {/* Quick crop select */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">{lang === 'te' ? 'పంట ఎంచుకోండి' : 'Quick Select'}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {CROP_OPTIONS.map(c => (
                  <button key={c.name} type="button"
                    onClick={() => setForm({ ...form, cropName: c.name, cropNameTE: c.nameTE })}
                    style={{
                      padding: '4px 10px', borderRadius: 16, border: `1.5px solid ${form.cropName === c.name ? 'var(--gold)' : '#e0ece4'}`,
                      background: form.cropName === c.name ? '#fef9c3' : 'white', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600,
                      color: form.cropName === c.name ? '#854d0e' : 'var(--text-mid)'
                    }}>
                    {c.icon} {lang === 'te' ? c.nameTE : c.name}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handlePost}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('cropName')} *</label>
                  <input className="form-input" placeholder="Crop name" value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">తెలుగు పేరు</label>
                  <input className="form-input" placeholder="పంట పేరు" value={form.cropNameTE} onChange={e => setForm({ ...form, cropNameTE: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">📦 {t('quantity')} *</label>
                  <input className="form-input" placeholder="e.g. 500 quintals" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">⚖️ Qty in KG</label>
                  <input className="form-input" type="number" placeholder="Total kg" value={form.quantityKg} onChange={e => setForm({ ...form, quantityKg: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">💰 {t('price')} ₹/kg *</label>
                  <input className="form-input" type="number" placeholder="Price per kg" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">📏 Unit</label>
                  <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="kg">Kilogram</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">🚪 Delivery Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['door', 'pickup'].map(dt => (
                    <button key={dt} type="button"
                      onClick={() => setForm({ ...form, deliveryType: dt })}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${form.deliveryType === dt ? 'var(--green-mid)' : '#e0ece4'}`,
                        background: form.deliveryType === dt ? 'var(--surface)' : 'white', cursor: 'pointer',
                        fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem',
                        color: form.deliveryType === dt ? 'var(--green-dark)' : 'var(--text-mid)'
                      }}>
                      {dt === 'door' ? '🚪 Door Pickup' : '🏪 Farmer Pickup'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">📝 Description</label>
                <textarea className="form-input" rows={2} placeholder="Quality, timeline, etc..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              {/* Live profit preview */}
              {form.price && form.quantityKg && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                  <strong style={{ color: 'var(--green-dark)' }}>💹 Farmer earns: ₹{(Number(form.price) * Number(form.quantityKg)).toLocaleString('en-IN')}</strong>
                  <span style={{ color: 'var(--text-light)', marginLeft: 8 }}>for {form.quantityKg} kg @ ₹{form.price}/kg</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>📤 {lang === 'te' ? 'పోస్ట్ చేయండి' : 'Post Request'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>✕</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { key: 'all', label: lang === 'te' ? 'అన్నీ' : 'All' },
            { key: 'open', label: lang === 'te' ? 'తెరిచి' : 'Open' },
            { key: 'accepted_plus', label: lang === 'te' ? 'యాక్టివ్' : 'Active' },
            { key: 'completed', label: lang === 'te' ? 'పూర్తి' : 'Completed' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
                background: filter === f.key ? 'var(--green-mid)' : 'white',
                color: filter === f.key ? 'white' : 'var(--text-mid)',
                border: `1px solid ${filter === f.key ? 'var(--green-mid)' : '#e0ece4'}`
              }}>{f.label}</button>
          ))}
        </div>

        {/* ── Request List ── */}
        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">{t('noRequests')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(req => {
                const isSelected = selected?._id === req._id;
                const sc = statusColors[req.status] || '#6b7280';
                const stageInfo = STAGES.find(s => s.key === req.deliveryStage);
                return (
                  <div key={req._id}
                    onClick={() => setSelected(isSelected ? null : req)}
                    style={{
                      background: isSelected ? '#f0fdf4' : 'white', borderRadius: 14,
                      padding: '1rem', cursor: 'pointer',
                      border: `2px solid ${isSelected ? 'var(--green-mid)' : '#e8f5ee'}`,
                      boxShadow: isSelected ? '0 4px 16px rgba(45,122,79,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s',
                      borderLeft: `5px solid ${sc}`
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--green-dark)' }}>
                          {CROP_OPTIONS.find(c => c.name === req.cropName)?.icon || '🌾'} {lang === 'te' ? (req.cropNameTE || req.cropName) : req.cropName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2 }}>
                          📦 {req.quantity} · 💰 ₹{req.price}/{req.unit}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ background: sc + '18', color: sc, fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                          {req.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {stageInfo && <span style={{ fontSize: '0.7rem', color: stageInfo.color }}>
                          {stageInfo.icon} {lang === 'te' ? stageInfo.labelTE : stageInfo.label}
                        </span>}
                      </div>
                    </div>
                    {req.acceptedBy?.userName && (
                      <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                        🧑‍🌾 {req.acceptedBy.userName} · 📍 {req.acceptedBy.village}
                      </div>
                    )}
                    {req.messages?.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: '0.72rem', color: '#3b82f6' }}>
                        💬 {req.messages.length} {lang === 'te' ? 'సందేశాలు' : 'messages'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ── RIGHT DETAIL PANEL ─────────────────────────────────── */}
      {selected && (
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: 'white', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ color: 'var(--green-dark)', fontWeight: 800, fontSize: '1.2rem' }}>
              {CROP_OPTIONS.find(c => c.name === selected.cropName)?.icon || '🌾'} {lang === 'te' ? (selected.cropNameTE || selected.cropName) : selected.cropName}
            </h3>
            <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>

          {/* Stage Tracker */}
          {selected.deliveryStage && <StageTracker currentStage={selected.deliveryStage} lang={lang} />}

          {/* Request info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { icon: '📦', label: t('quantity'), val: selected.quantity },
              { icon: '💰', label: t('price'), val: `₹${selected.price}/${selected.unit}` },
              { icon: '🚪', label: 'Delivery', val: selected.deliveryType === 'door' ? 'Door Pickup' : 'Farm Pickup' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: 'var(--green-dark)', fontSize: '0.85rem' }}>{item.val}</div>
              </div>
            ))}
          </div>

          {/* Profit Calculator */}
          {selected.price && selected.quantityKg && <ProfitCard request={selected} lang={lang} />}

          {/* Farmer details */}
          {selected.acceptedBy?.userName && (
            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: 14, padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ color: '#1e40af', fontWeight: 800, marginBottom: '0.75rem' }}>🧑‍🌾 {t('farmerDetails')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: '#1e3a5f' }}>
                <div><strong>👤</strong> {selected.acceptedBy.userName}</div>
                <div><strong>📱</strong> <a href={`tel:${selected.acceptedBy.userMobile}`} style={{ color: '#2563eb', fontWeight: 700 }}>{selected.acceptedBy.userMobile}</a></div>
                <div><strong>📍</strong> {selected.acceptedBy.village}, {selected.acceptedBy.district}</div>
                <div><strong>📮</strong> {selected.acceptedBy.pincode || '—'}</div>
                <div style={{ gridColumn: '1/-1' }}><strong>🏠 {t('address')}:</strong> {selected.acceptedBy.address}</div>
                {selected.acceptedBy.landmarkNote && <div style={{ gridColumn: '1/-1' }}><strong>🗺️ Landmark:</strong> {selected.acceptedBy.landmarkNote}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <a href={`tel:${selected.acceptedBy.userMobile}`} className="btn btn-success btn-sm" style={{ textDecoration: 'none' }}>📞 Call</a>
                <a href={(() => {
                    const crop = lang === 'te' ? (selected.cropNameTE || selected.cropName) : selected.cropName;
                    const farmer = selected.acceptedBy.userName;
                    const village = selected.acceptedBy.village;
                    const qty = selected.quantity;
                    const price = selected.price;
                    const unit = selected.unit;
                    const adminName = selected.adminName;
                    const msgEN = `Hello ${farmer}! 🙏\n\nThis is ${adminName} from Crop2Cash regarding your *${crop}* crop pickup.\n\n📦 Quantity: ${qty}\n💰 Price: ₹${price}/${unit}\n📍 Location: ${village}\n\nOur agent will come to your address for door pickup. Please keep the crop ready.\n\nThank you! 🌾 - Crop2Cash`;
                    const msgTE = `నమస్కారం ${farmer}! 🙏\n\nనేను Crop2Cash నుండి ${adminName} మాట్లాడుతున్నాను. మీ *${crop}* పికప్ గురించి.\n\n📦 పరిమాణం: ${qty}\n💰 ధర: ₹${price}/${unit}\n📍 స్థానం: ${village}\n\nమా ఏజెంట్ త్వరలో మీ ఇంటికి వచ్చి పంట తీసుకుంటారు. సిద్ధంగా ఉంచండి.\n\nధన్యవాదాలు! 🌾 - Crop2Cash`;
                    return `https://wa.me/91${selected.acceptedBy.userMobile}?text=${encodeURIComponent(lang === 'te' ? msgTE : msgEN)}`;
                  })()}
                  target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#25D366', color: 'white', textDecoration: 'none' }}>
                  💬 WhatsApp
                </a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(selected.acceptedBy.address + ' ' + selected.acceptedBy.village)}`}
                  target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#4285F4', color: 'white', textDecoration: 'none' }}>
                  🗺️ Map
                </a>
              </div>
            </div>
          )}

          {/* Stage Update */}
          {selected.status !== 'open' && selected.status !== 'completed' && (
            <div style={{ background: '#fafafa', border: '1px solid #e0ece4', borderRadius: 14, padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--green-dark)', fontWeight: 800, marginBottom: '0.75rem' }}>
                🚚 {lang === 'te' ? 'స్టేజ్ అప్‌డేట్' : 'Update Delivery Stage'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '0.75rem' }}>
                {STAGES.map(s => {
                  const current = selected.deliveryStage === s.key;
                  return (
                    <button key={s.key}
                      onClick={() => setStageForm({ ...stageForm, stage: s.key })}
                      style={{
                        padding: '8px 10px', borderRadius: 10, border: `2px solid ${stageForm.stage === s.key ? s.color : '#e0ece4'}`,
                        background: stageForm.stage === s.key ? s.bg : current ? s.bg + '88' : 'white',
                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.78rem',
                        color: stageForm.stage === s.key ? s.color : current ? s.color : 'var(--text-mid)',
                        display: 'flex', alignItems: 'center', gap: 5
                      }}>
                      <span>{s.icon}</span>
                      <span>{lang === 'te' ? s.labelTE : s.label}</span>
                      {current && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.8 }}>current</span>}
                    </button>
                  );
                })}
              </div>
              {stageForm.stage && (
                <>
                  {(stageForm.stage === 'out_for_delivery') && (
                    <div className="form-group">
                      <label className="form-label">👤 Delivery Agent Name</label>
                      <input className="form-input" style={{ padding: '7px 12px' }} placeholder="Agent name"
                        value={stageForm.deliveryAgent} onChange={e => setStageForm({ ...stageForm, deliveryAgent: e.target.value })} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">📝 Note (optional)</label>
                    <input className="form-input" style={{ padding: '7px 12px' }} placeholder="Add a note..."
                      value={stageForm.note} onChange={e => setStageForm({ ...stageForm, note: e.target.value })} />
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleStageUpdate}>
                    ✅ {lang === 'te' ? 'స్టేజ్ నవీకరించు' : 'Update Stage & Notify Farmer'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Stage History */}
          {selected.stageHistory?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--green-dark)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                📜 {lang === 'te' ? 'స్టేజ్ చరిత్ర' : 'Stage History'}
              </h4>
              <div style={{ borderLeft: '2px solid #e0ece4', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selected.stageHistory.map((h, i) => {
                  const si = STAGES.find(s => s.key === h.stage);
                  return (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-mid)', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -17, top: 3, width: 10, height: 10, borderRadius: '50%', background: si?.color || 'var(--green-mid)' }} />
                      <strong style={{ color: si?.color || 'var(--green-dark)' }}>{si?.icon} {lang === 'te' ? si?.labelTE : si?.label || h.stage}</strong>
                      {(h.noteTE || h.noteEN || h.note) && (
                        <span style={{ marginLeft: 4 }}>
                          — {lang === 'te' ? (h.noteTE || h.note) : (h.noteEN || h.note)}
                        </span>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {new Date(h.timestamp).toLocaleString('en-IN')} · {h.updatedBy}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat */}
          {selected.acceptedBy?.userName && (
            <ChatBox request={selected} adminName={admin?.name} onSend={handleSendMessage} lang={lang} />
          )}

          {/* Delete */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
            {selected.status === 'delivered' && (
              <button className="btn btn-success btn-sm" onClick={() => { API.put(`/requests/${selected._id}/complete`); fetchRequests(); }}>
                💰 {lang === 'te' ? 'చెల్లింపు పూర్తి' : 'Mark Payment Done'}
              </button>
            )}
            <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleDelete(selected._id)}>
              🗑️ {t('delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
