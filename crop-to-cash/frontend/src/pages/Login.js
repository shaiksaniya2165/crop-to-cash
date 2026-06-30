import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function Login() {
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.mobile || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      loginUser(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-illustration">🌾</div>
        <h2>{t('welcomeTitle')}</h2>
        <p>{t('welcomeSubtitle')}</p>
        <div className="auth-features">
          <div className="auth-feature"><span className="auth-feature-icon">📊</span>{t('cropRates')}</div>
          <div className="auth-feature"><span className="auth-feature-icon">🌤️</span>{t('weatherForecast')}</div>
          <div className="auth-feature"><span className="auth-feature-icon">🌱</span>{t('cropSuggest')}</div>
          <div className="auth-feature"><span className="auth-feature-icon">👥</span>{t('community')}</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>{t('signIn')}</h3>
              <p>{t('dontHaveAccount')} <Link to="/register" style={{ color: 'var(--green-mid)', fontWeight: 600 }}>{t('signUp')}</Link></p>
            </div>
            <select className="lang-select" style={{ background: 'var(--surface)', color: 'var(--text-dark)', border: '1px solid #e0ece4' }} value={lang} onChange={e => changeLang(e.target.value)}>
              <option value="en">🇬🇧 EN</option>
              <option value="te">🇮🇳 TE</option>
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">📱 {t('mobileNumber')}</label>
              <input className="form-input" type="tel" placeholder="10-digit mobile number" maxLength={10}
                value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 {t('password')}</label>
              <input className="form-input" type="password" placeholder="Enter password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? '...' : `${t('signIn')} →`}
            </button>
          </form>

          <div className="auth-link" style={{ marginTop: '1rem' }}>
            <Link to="/admin/login" style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
              🔐 {t('adminLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
