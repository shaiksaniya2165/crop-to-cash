import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function Home() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t, lang } = useLang();

  useEffect(() => {
    API.get('/crops/rates').then(({ data }) => { setCrops(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <h1>
            {lang === 'te' ? (
              <>రైతులకు <span>శక్తి</span> ఇవ్వడం</>
            ) : (
              <><span>Empowering</span> Farmers</>
            )}
          </h1>
          <p>{t('welcomeSubtitle')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/requests" className="btn btn-gold">{lang === 'te' ? '🛒 మార్కెట్ అభ్యర్థనలు చూడండి' : '🛒 View Market Requests'}</Link>
            <Link to="/crop-advisor" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              {lang === 'te' ? '🌱 పంట సలహా పొందండి' : '🌱 Get Crop Advice'}
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">12+</div><div className="stat-label">{lang === 'te' ? 'పంటలు' : 'Crops'}</div></div>
            <div className="stat"><div className="stat-num">7</div><div className="stat-label">{lang === 'te' ? 'రోజుల అంచనా' : 'Day Forecast'}</div></div>
            <div className="stat"><div className="stat-num">∞</div><div className="stat-label">{lang === 'te' ? 'రైతులు' : 'Farmers'}</div></div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="page" style={{ paddingTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🌤️', label: t('weather'), path: '/weather', color: '#1e3a5f' },
            { icon: '🌱', label: t('cropSuggest'), path: '/crop-advisor', color: '#1a4d2e' },
            { icon: '👥', label: t('community'), path: '/community', color: '#7c2d12' },
            { icon: '📋', label: t('requests'), path: '/requests', color: '#3b0764' },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ textAlign: 'center', background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`, color: 'white', border: 'none' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Crop Rates */}
        <div className="section-header">
          <h2 className="section-title">📊 {t('todayRates')}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 20 }}>
            {new Date().toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="crop-grid">
            {crops.map(crop => (
              <div key={crop._id} className="crop-card">
                <div className="crop-icon">{crop.icon}</div>
                <div className="crop-name">{lang === 'te' ? crop.nameTE : crop.name}</div>
                {lang === 'en' && <div className="crop-name-te">{crop.nameTE}</div>}
                <div className="crop-price">₹{crop.price.toLocaleString('en-IN')}</div>
                <div className="crop-unit">/{t('perQuintal')}</div>
                <div className={`crop-change ${crop.change >= 0 ? 'change-up' : 'change-down'}`}>
                  {crop.change >= 0 ? '▲' : '▼'} ₹{Math.abs(crop.change)} {lang === 'te' ? 'నేడు' : 'today'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welcome user card */}
        {user && (
          <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, var(--green-dark), var(--green-mid))', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>🧑‍🌾</div>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{lang === 'te' ? `నమస్కారం, ${user.name}!` : `Welcome back, ${user.name}!`}</h3>
                <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
                  {user.village && `📍 ${user.village}`}
                  {user.district && `, ${user.district}`}
                  {user.landType && ` • 🌍 ${user.landType} ${lang === 'te' ? 'నేల' : 'soil'}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
