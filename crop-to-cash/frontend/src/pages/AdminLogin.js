import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/admin/register' : '/auth/admin/login';
      const { data } = await API.post(endpoint, form);
      loginAdmin(data.admin, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ background: 'linear-gradient(160deg, #1a2e1f 0%, #2d4a3e 50%, #3d6b50 100%)' }}>
        <div className="auth-illustration">🏛️</div>
        <h2>Admin Portal</h2>
        <p>Manage crop requests, monitor market rates and connect with farmers across the region.</p>
        <div className="auth-features">
          <div className="auth-feature"><span>📋</span> Post Crop Procurement Requests</div>
          <div className="auth-feature"><span>👨‍🌾</span> View & Contact Farmers</div>
          <div className="auth-feature"><span>📈</span> Update Market Rates</div>
          <div className="auth-feature"><span>✅</span> Manage Transactions</div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: 12, position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Demo Admin:</p>
          <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 600 }}>📱 9999999999 | 🔒 admin123</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>🔐 {isRegister ? 'Admin Register' : t('adminLogin')}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              {isRegister ? 'Create new admin account' : 'Sign in to Admin Panel'}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            <button className={`tab ${!isRegister ? 'active' : ''}`} onClick={() => setIsRegister(false)}>Login</button>
            <button className={`tab ${isRegister ? 'active' : ''}`} onClick={() => setIsRegister(true)}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">👤 {t('adminName')} *</label>
                <input className="form-input" placeholder="Admin full name"
                  value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">📱 {t('mobileNumber')}</label>
              <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile"
                value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 {t('password')}</label>
              <input className="form-input" type="password" placeholder="Admin password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)' }}>
              {loading ? '...' : isRegister ? 'Create Admin Account' : `${t('signIn')} →`}
            </button>
          </form>

          <div className="auth-link">
            <Link to="/login">← {t('login')} as Farmer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
