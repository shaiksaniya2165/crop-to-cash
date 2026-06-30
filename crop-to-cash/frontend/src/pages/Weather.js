import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Guntur');
  const { t, lang } = useLang();

  const cityCoords = {
    'Guntur':        { lat: 16.3067, lon: 80.4365 },
    'Vijayawada':    { lat: 16.5062, lon: 80.6480 },
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Nellore':       { lat: 14.4426, lon: 79.9865 },
    'Kurnool':       { lat: 15.8281, lon: 78.0373 },
    'Warangal':      { lat: 18.0000, lon: 79.5800 },
    'Hyderabad':     { lat: 17.3850, lon: 78.4867 },
    'Tirupati':      { lat: 13.6288, lon: 79.4192 },
  };

  // Fetch whenever city changes
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setWeather(null); // clear old data so UI refreshes fully
    try {
      const coords = cityCoords[cityName] || cityCoords['Guntur'];
      const { data } = await API.get(`/weather?lat=${coords.lat}&lon=${coords.lon}&city=${encodeURIComponent(cityName)}`);
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
    }
    setLoading(false);
  };

  const current = weather?.current;
  const forecast = weather?.forecast || [];

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🌤️ {t('weatherForecast')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>📍</span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={city}
            onChange={e => setCity(e.target.value)}
          >
            {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {loading && <div style={{ width: 20, height: 20, border: '3px solid var(--surface)', borderTopColor: 'var(--green-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
        </div>
      </div>

      {loading && !weather ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <>
          {current && (
            <div className="weather-hero">
              <div className="weather-city">📍 {weather?.city?.name || city}, Andhra Pradesh</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <div className="weather-temp">{current.temp}°C</div>
                <div>
                  <div className="weather-desc">
                    {current.icon} {lang === 'te' ? (current.descriptionTE || current.description) : current.description}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{t('feelsLike')} {current.feels_like}°C</div>
                </div>
              </div>
              <div className="weather-meta">
                <div className="weather-meta-item">💧 {t('humidity')}: {current.humidity}%</div>
                <div className="weather-meta-item">💨 {t('wind')}: {current.wind_speed} km/h</div>
                <div className="weather-meta-item">🌡️ {t('pressure')}: {current.pressure} hPa</div>
              </div>
            </div>
          )}

          <h3 style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: '1rem' }}>
            {lang === 'te' ? '7 రోజుల అంచనా' : '7-Day Forecast'}
          </h3>
          <div className="weather-forecast">
            {forecast.map((day, i) => (
              <div key={`${city}-${i}`} className="forecast-card">
                <div className="forecast-day">{lang === 'te' ? (day.dayTE || getTEDay(i)) : day.day}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{day.date}</div>
                <div className="forecast-icon">{day.icon}</div>
                <div className="forecast-temp">{day.temp_max}° / {day.temp_min}°</div>
                <div className="forecast-detail">💧 {day.humidity}%</div>
                <div className="forecast-detail">🌧️ {day.rain_chance}%</div>
                <div className="forecast-detail" style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  {lang === 'te' ? (day.descriptionTE || day.description) : day.description}
                </div>
              </div>
            ))}
          </div>

          {/* Farming Advisory */}
          <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>
              🌾 {lang === 'te' ? 'వ్యవసాయ సలహా' : 'Farming Advisory'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {getAdvisory(lang).map((item, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: '1rem', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--green-dark)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginTop: '0.25rem' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getTEDay(i) {
  const days = ['నేడు', 'రేపు', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం', 'ఆదివారం'];
  return days[i] || '';
}

function getAdvisory(lang) {
  return lang === 'te' ? [
    { icon: '☀️', title: 'నీటిపారుదల', desc: 'వేడి రోజులలో తెల్లవారుజామున లేదా సాయంత్రం నీరు పెట్టండి' },
    { icon: '🌧️', title: 'వర్షం సిద్ధం', desc: 'వర్షానికి ముందు పురుగుమందు పిచికారీ చేయకండి' },
    { icon: '🌡️', title: 'ఉష్ణోగ్రత', desc: 'అధిక ఉష్ణోగ్రతలో పంటలను రక్షించండి' },
    { icon: '💨', title: 'గాలి హెచ్చరిక', desc: 'బలమైన గాలులకు ముందు పంటను బంధించండి' },
  ] : [
    { icon: '☀️', title: 'Irrigation Tip', desc: 'On hot days, water crops early morning or evening to reduce evaporation' },
    { icon: '🌧️', title: 'Rain Prep', desc: 'Avoid pesticide spraying 24hrs before expected rainfall' },
    { icon: '🌡️', title: 'Heat Advisory', desc: 'Cover sensitive crops during peak heat hours (12pm-3pm)' },
    { icon: '💨', title: 'Wind Warning', desc: 'Stake tall crops before strong winds forecast days' },
  ];
}
