import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import API from '../api';

export default function CropAdvisor() {
  const [soilType, setSoilType] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useLang();

  const soils = [
    { value: 'clay', label: t('clay'), icon: '🟫', desc: lang === 'te' ? 'నీరు నిలుపుకుంటుంది' : 'Water retentive' },
    { value: 'loamy', label: t('loamy'), icon: '🌱', desc: lang === 'te' ? 'సారవంతమైన నేల' : 'Most fertile soil' },
    { value: 'sandy', label: t('sandy'), icon: '🏖️', desc: lang === 'te' ? 'త్వరగా ఆరే నేల' : 'Fast draining' },
    { value: 'red', label: t('red'), icon: '🔴', desc: lang === 'te' ? 'ఖనిజ సమృద్ధ' : 'Mineral rich' },
    { value: 'black', label: t('black'), icon: '⚫', desc: lang === 'te' ? 'నీర్సాను నేల' : 'Cotton soil' },
  ];

  const handleGet = async () => {
    if (!soilType) return;
    setLoading(true);
    try {
      const { data } = await API.post('/crops/suggest', { soilType });
      setResult(data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">🌱 {t('cropSuggest')}</h2>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          {lang === 'te' ? 'మీ నేల రకం ఎంచుకుని పంట సలహా పొందండి' : 'Select your soil type to get personalized crop suggestions'}
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h3 style={{ color: 'var(--green-dark)', marginBottom: '1rem', fontWeight: 700 }}>
          🌍 {t('soilType')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {soils.map(soil => (
            <div key={soil.value}
              onClick={() => setSoilType(soil.value)}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${soilType === soil.value ? 'var(--green-mid)' : '#e0ece4'}`,
                background: soilType === soil.value ? 'var(--surface)' : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)',
                transform: soilType === soil.value ? 'scale(1.03)' : 'scale(1)',
                boxShadow: soilType === soil.value ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{soil.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{soil.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>{soil.desc}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleGet} disabled={!soilType || loading}
          style={{ maxWidth: 300, margin: '0 auto', display: 'flex' }}>
          {loading ? '...' : `🔍 ${t('getSuggestion')}`}
        </button>

        {result && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div className="suggestion-section">
              <h3 style={{ color: 'var(--green-dark)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌾 {t('recommendedCrops')}
              </h3>
              <div className="suggestion-tags">
                {result.recommendedCrops.map((crop, i) => (
                  <span key={i} className="suggestion-tag">{crop}</span>
                ))}
              </div>
            </div>

            <div className="suggestion-section">
              <h3 style={{ color: 'var(--earth)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🧪 {t('suggestedPesticides')}
              </h3>
              <div className="suggestion-tags">
                {result.pesticides.map((p, i) => (
                  <span key={i} className="pesticide-tag">🧴 {p}</span>
                ))}
              </div>
            </div>

            <div className="suggestion-section">
              <h3 style={{ color: '#1e40af', fontWeight: 700, marginBottom: '1rem' }}>
                💡 {t('farmingTips')}
              </h3>
              <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
                {result.tips.map((tip, i) => (
                  <div key={i} className="tip-item">
                    <span className="tip-icon">✅</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pesticide safety */}
            <div className="card" style={{ background: '#fff7ed', border: '1px solid #fed7aa', marginTop: '1rem' }}>
              <h4 style={{ color: '#9a3412', marginBottom: '0.75rem' }}>⚠️ {lang === 'te' ? 'పురుగుమందు జాగ్రత్తలు' : 'Pesticide Safety'}</h4>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#7c2d12', lineHeight: 1.8 }}>
                {(lang === 'te' ? [
                  'పురుగుమందు వాడేటప్పుడు గ్లోవ్స్ ధరించండి',
                  'గాలి దిక్కుకు వ్యతిరేకంగా పిచికారీ చేయకండి',
                  'పిచికారీ తర్వాత 7-10 రోజులకు పంటను కోయండి',
                  'దగ్గర నీటి వనరులు ఉన్నచోట జాగ్రత్తగా వాడండి'
                ] : [
                  'Always wear protective gloves when handling pesticides',
                  'Do not spray against wind direction',
                  'Harvest crops 7-10 days after pesticide application',
                  'Use carefully near water sources'
                ]).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
