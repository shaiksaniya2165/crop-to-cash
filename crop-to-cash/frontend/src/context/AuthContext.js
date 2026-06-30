import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('c2c_user')); } catch { return null; }
  });
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('c2c_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('c2c_token') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('c2c_admin_token') || null);

  const loginUser = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem('c2c_user', JSON.stringify(userData));
    localStorage.setItem('c2c_token', tok);
  };
  const loginAdmin = (adminData, tok) => {
    setAdmin(adminData); setAdminToken(tok);
    localStorage.setItem('c2c_admin', JSON.stringify(adminData));
    localStorage.setItem('c2c_admin_token', tok);
  };
  const logoutUser = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('c2c_user'); localStorage.removeItem('c2c_token');
  };
  const logoutAdmin = () => {
    setAdmin(null); setAdminToken(null);
    localStorage.removeItem('c2c_admin'); localStorage.removeItem('c2c_admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, admin, token, adminToken, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
