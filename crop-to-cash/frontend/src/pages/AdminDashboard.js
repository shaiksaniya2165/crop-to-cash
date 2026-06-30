import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

const STAGE_PIPELINE = [
  { key: 'accepted',         icon: '✅', label: 'Accepted',        labelTE: 'అంగీకరించారు',     color: '#3b82f6', bg: '#eff6ff' },
  { key: 'pending_pickup',   icon: '⏳', label: 'Pending Pickup',   labelTE: 'పికప్ పెండింగ్',   color: '#f59e0b', bg: '#fffbeb' },
  { key: 'out_for_delivery', icon: '🚚', label: 'Out for Delivery', labelTE: 'డెలివరీలో ఉంది',  color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'delivered',        icon: '📦', label: 'Crop Collected',   labelTE: 'పంట తీసుకున్నారు', color: '#10b981', bg: '#ecfdf5' },
  { key: 'completed',        icon: '💰', label: 'Payment Done',     labelTE: 'చెల్లింపు పూర్తి', color: '#059669', bg: '#d1fae5' },
];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    Promise.all([API.get('/requests/admin/mine'), API.get('/crops/rates')])
      .then(([r, c]) => { setRequests(r.data); setCrops(c.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = requests.length;
  const openCount = requests.filter(r => r.status === 'open').length;
  const activeCount = requests.filter(r => ['accepted', 'pending_pickup', 'out_for_delivery', 'delivered'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const totalRevenue = requests.filter(r => r.profit).reduce((a, r) => a + (r.profit?.totalRevenue || 0), 0);
  const totalFarmerProfit = requests.filter(r => r.profit).reduce((a, r) => a + Math.max(0, r.profit?.directProfit || 0), 0);

  const pipelineData = STAGE_PIPELINE.map(s => ({
    ...s,
    count: requests.filter(r => r.status === s.key || r.deliveryStage === s.key.replace('pending_pickup', 'pending')).length
  }));

  const recentActive = requests.filter(r => ['accepted', 'pending_pickup', 'out_for_delivery', 'delivered'].includes(r.status)).slice(0, 4);

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--cream)' }}>

      {/* Admin Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0d1f14 0%, #1a4d2e 60%, #2d7a4f 100%)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', background: 'linear-gradient(135deg, transparent, rgba(245,166,35,0.08))' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                🏛️ {lang === 'te' ? 'అడ్మిన్ పోర్టల్' : 'Admin Portal'}
              </div>
              <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.7rem', marginBottom: '0.25rem' }}>
                {lang === 'te' ? `నమస్కారం, ${admin?.name}!` : `Welcome, ${admin?.name}!`}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                {lang === 'te' ? 'పంట సేకరణ పైప్‌లైన్ పర్యవేక్షించండి' : 'Monitor your crop procurement pipeline'}
              </p>
            </div>
            <Link to="/admin/requests" className="btn btn-gold">
              + {lang === 'te' ? 'కొత్త అభ్యర్థన' : 'New Request'}
            </Link>
          </div>

          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { n: total, l: lang === 'te' ? 'మొత్తం' : 'Total Requests', icon: '📋', c: '#60a5fa' },
              { n: openCount, l: lang === 'te' ? 'తెరిచి ఉన్నవి' : 'Open', icon: '🟢', c: '#34d399' },
              { n: activeCount, l: lang === 'te' ? 'యాక్టివ్ డీల్స్' : 'Active Deals', icon: '🚚', c: '#fbbf24' },
              { n: completedCount, l: lang === 'te' ? 'పూర్తైనవి' : 'Completed', icon: '✅', c: '#86efac' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ color: s.c, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        {loading ? <div className="loading"><div className="spinner"></div></div> : (
          <>
            {/* Revenue & Profit Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', borderRadius: 16, padding: '1.25rem', color: 'white' }}>
                <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  💰 {lang === 'te' ? 'మొత్తం ఆదాయం' : 'Total Revenue'}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  {lang === 'te' ? `${completedCount} పూర్తైన డీల్స్ నుండి` : `From ${completedCount} completed deals`}
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #065f46, #10b981)', borderRadius: 16, padding: '1.25rem', color: 'white' }}>
                <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  📈 {lang === 'te' ? 'రైతులకు అదనపు లాభం' : 'Extra Profit to Farmers'}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#bbf7d0' }}>
                  ₹{totalFarmerProfit.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  {lang === 'te' ? 'మార్కెట్ రేటు కంటే అదనంగా' : 'Above market rate'}
                </div>
              </div>
            </div>

            {/* ── Delivery Pipeline ── */}
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e8f5ee' }}>
              <h3 style={{ color: 'var(--green-dark)', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                🚚 {lang === 'te' ? 'డెలివరీ పైప్‌లైన్' : 'Delivery Pipeline'}
                <Link to="/admin/requests" style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: 600 }}>
                  {lang === 'te' ? 'అన్నీ చూడండి →' : 'View All →'}
                </Link>
              </h3>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>
                {pipelineData.map((stage, i) => (
                  <React.Fragment key={stage.key}>
                    <div style={{ flex: 1, minWidth: 100, background: stage.count > 0 ? stage.bg : '#f9fafb', borderRadius: i === 0 ? '12px 0 0 12px' : i === pipelineData.length - 1 ? '0 12px 12px 0' : 0, padding: '1rem', textAlign: 'center', border: `1px solid ${stage.count > 0 ? stage.color + '33' : '#e5e7eb'}`, transition: 'all 0.3s' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{stage.icon}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stage.count > 0 ? stage.color : '#d1d5db' }}>
                        {stage.count}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: stage.count > 0 ? stage.color : '#9ca3af', lineHeight: 1.2 }}>
                        {lang === 'te' ? stage.labelTE : stage.label}
                      </div>
                    </div>
                    {i < pipelineData.length - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderLeft: 'none', borderRight: 'none' }}>
                        <span style={{ color: '#d1d5db', fontSize: '1.2rem', padding: '0 4px' }}>›</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Active Deals ── */}
            {recentActive.length > 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e8f5ee' }}>
                <h3 style={{ color: 'var(--green-dark)', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔥 {lang === 'te' ? 'యాక్టివ్ డీల్స్' : 'Active Deals'}
                  <Link to="/admin/requests" style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: 600 }}>
                    {lang === 'te' ? 'నిర్వహించండి →' : 'Manage →'}
                  </Link>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentActive.map(req => {
                    const stage = STAGE_PIPELINE.find(s => s.key === req.status || s.key === req.status);
                    return (
                      <Link key={req._id} to="/admin/requests" style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.75rem 1rem', borderRadius: 12,
                          background: stage?.bg || '#f9fafb',
                          border: `1px solid ${stage?.color + '33' || '#e5e7eb'}`,
                          transition: 'all 0.2s', cursor: 'pointer'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>{stage?.icon || '📋'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: 'var(--green-dark)', fontSize: '0.92rem' }}>
                              🌾 {lang === 'te' ? (req.cropNameTE || req.cropName) : req.cropName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2 }}>
                              🧑‍🌾 {req.acceptedBy?.userName} · 📍 {req.acceptedBy?.village}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: stage?.color || 'var(--green-mid)', fontSize: '0.8rem' }}>
                              {lang === 'te' ? STAGE_PIPELINE.find(s => s.key === req.status)?.labelTE : STAGE_PIPELINE.find(s => s.key === req.status)?.label}
                            </div>
                            {req.profit?.totalRevenue && (
                              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                                ₹{req.profit.totalRevenue.toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <a href={`tel:${req.acceptedBy?.userMobile}`}
                              onClick={e => e.stopPropagation()}
                              style={{ background: '#22c55e', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                              📞 Call
                            </a>
                            <a href={(() => {
                                const crop = lang === 'te' ? (req.cropNameTE || req.cropName) : req.cropName;
                                const farmer = req.acceptedBy?.userName;
                                const msgEN = `Hello ${farmer}! 🙏 This is ${req.adminName} from Crop2Cash. Our agent is coming to collect your *${crop}*. Please be available. Thank you! 🌾`;
                                const msgTE = `నమస్కారం ${farmer}! 🙏 నేను Crop2Cash నుండి ${req.adminName}. మా ఏజెంట్ మీ *${crop}* తీసుకోవడానికి వస్తున్నారు. అందుబాటులో ఉండండి. ధన్యవాదాలు! 🌾`;
                                return `https://wa.me/91${req.acceptedBy?.userMobile}?text=${encodeURIComponent(lang === 'te' ? msgTE : msgEN)}`;
                              })()}
                              target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ background: '#25D366', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                              💬 WA
                            </a>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Quick Nav ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '📋', label: lang === 'te' ? 'అభ్యర్థనలు నిర్వహించు' : 'Manage Requests', sub: lang === 'te' ? `${openCount} తెరిచి ఉన్నవి` : `${openCount} open`, path: '/admin/requests', color: '#f5a623' },
                { icon: '📊', label: lang === 'te' ? 'పంట ధరలు' : 'Crop Rates', sub: `${crops.length} crops`, path: '/admin/requests', color: '#22c55e' },
                { icon: '🚚', label: lang === 'te' ? 'యాక్టివ్ పికప్స్' : 'Active Pickups', sub: `${activeCount} ${lang === 'te' ? 'యాక్టివ్' : 'active'}`, path: '/admin/requests', color: '#8b5cf6' },
                { icon: '💰', label: lang === 'te' ? 'పూర్తైన డీల్స్' : 'Completed Deals', sub: `${completedCount} ${lang === 'te' ? 'పూర్తి' : 'done'}`, path: '/admin/requests', color: '#059669' },
              ].map((item, i) => (
                <Link key={i} to={item.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'white', borderRadius: 14, padding: '1.25rem',
                    border: `1px solid ${item.color}22`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderLeft: `4px solid ${item.color}`,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, color: 'var(--green-dark)', fontSize: '0.92rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
