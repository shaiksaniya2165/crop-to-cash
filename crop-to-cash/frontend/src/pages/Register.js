import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', mobile: '', password: '', village: '', district: '', landType: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.password) { setError('Fill all required fields'); return; }
    if (form.mobile.length !== 10) { setError('Enter valid 10-digit mobile'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      loginUser(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const soilTypes = [
    { value: 'clay', label: t('clay') }, { value: 'loamy', label: t('loamy') },
    { value: 'sandy', label: t('sandy') }, { value: 'red', label: t('red') },
    { value: 'black', label: t('black') }
  ];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-illustration">🧑‍🌾</div>
        <h2>{lang === 'te' ? 'రైతు కుటుంబంలో చేరండి' : 'Join the Farmer Family'}</h2>
        <p>{lang === 'te' ? 'మీ వ్యవసాయ ప్రయాణాన్ని ప్రారంభించండి' : 'Start your farming journey with us'}</p>
        <div className="auth-features">
          <div className="auth-feature"><span>✅</span> {lang === 'te' ? 'ఉచిత నమోదు' : 'Free Registration'}</div>
          <div className="auth-feature"><span>✅</span> {lang === 'te' ? 'మార్కెట్ అభ్యర్థనలు పొందండి' : 'Get Market Requests'}</div>
          <div className="auth-feature"><span>✅</span> {lang === 'te' ? 'రైతులతో కనెక్ట్ అవ్వండి' : 'Connect with Farmers'}</div>
          <div className="auth-feature"><span>✅</span> {lang === 'te' ? 'నేల ఆధారిత సలహా' : 'Soil-based Crop Advice'}</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3>{t('signUp')}</h3>
              <p>{t('alreadyHaveAccount')} <Link to="/login" style={{ color: 'var(--green-mid)', fontWeight: 600 }}>{t('signIn')}</Link></p>
            </div>
            <select className="lang-select" style={{ background: 'var(--surface)', color: 'var(--text-dark)', border: '1px solid #e0ece4' }} value={lang} onChange={e => changeLang(e.target.value)}>
              <option value="en">EN</option>
              <option value="te">TE</option>
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">👤 {t('name')} *</label>
              <input className="form-input" placeholder={lang === 'te' ? 'మీ పూర్తి పేరు' : 'Your full name'}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">📱 {t('mobileNumber')} *</label>
              <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile"
                value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 {t('password')} *</label>
              <input className="form-input" type="password" placeholder={lang === 'te' ? 'పాస్‌వర్డ్ సెట్ చేయండి' : 'Set a password'}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🏘️ {t('village')}</label>
                <input className="form-input" placeholder={lang === 'te' ? 'మీ గ్రామం' : 'Your village'}
                  value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🗺️ {t('district')}</label>
                <input className="form-input" placeholder={lang === 'te' ? 'జిల్లా' : 'District'}
                  value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🌍 {t('landType')}</label>
              <select className="form-select" value={form.landType} onChange={e => setForm({ ...form, landType: e.target.value })}>
                <option value="">{lang === 'te' ? 'నేల రకం ఎంచుకోండి' : 'Select soil type'}</option>
                {soilTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? '...' : `${t('signUp')} 🌱`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
