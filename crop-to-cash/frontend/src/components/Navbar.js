import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Navbar() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const { lang, changeLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleUserLogout = () => { logoutUser(); navigate('/login'); };
  const handleAdminLogout = () => { logoutAdmin(); navigate('/admin/login'); };

  return (
    <nav className="navbar">
      <Link to={admin ? '/admin' : user ? '/home' : '/'} className="navbar-brand">
        <span className="navbar-logo">🌾</span>
        <span className="navbar-title">Crop<span>2</span>Cash</span>
      </Link>

      <ul className="navbar-links">
        {user && !admin && (
          <>
            <li><Link to="/home" className={isActive('/home')}>{t('home')}</Link></li>
            <li><Link to="/weather" className={isActive('/weather')}>{t('weather')}</Link></li>
            <li><Link to="/crop-advisor" className={isActive('/crop-advisor')}>{t('cropSuggest')}</Link></li>
            <li><Link to="/community" className={isActive('/community')}>{t('community')}</Link></li>
            <li><Link to="/requests" className={isActive('/requests')}>{t('requests')}</Link></li>
            <li><button className="nav-btn" onClick={handleUserLogout}>{t('logout')}</button></li>
          </>
        )}
        {admin && (
          <>
            <li><Link to="/admin" className={isActive('/admin')}>{t('adminDashboard')}</Link></li>
            <li><Link to="/admin/requests" className={isActive('/admin/requests')}>{t('requests')}</Link></li>
            <li><button className="nav-btn" onClick={handleAdminLogout}>{t('logout')}</button></li>
          </>
        )}
        {!user && !admin && (
          <>
            <li><Link to="/login" className={isActive('/login')}>{t('login')}</Link></li>
            <li><Link to="/register" className={isActive('/register')}>{t('register')}</Link></li>
            <li><Link to="/admin/login" className={isActive('/admin/login')}>{t('adminLogin')}</Link></li>
          </>
        )}
        <li>
          <select className="lang-select" value={lang} onChange={e => changeLang(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="te">🇮🇳 తెలుగు</option>
          </select>
        </li>
      </ul>
    </nav>
  );
}
