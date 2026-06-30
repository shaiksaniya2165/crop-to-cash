import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Weather from './pages/Weather';
import CropAdvisor from './pages/CropAdvisor';
import Community from './pages/Community';
import Requests from './pages/Requests';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import './index.css';

function ProtectedUser({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function ProtectedAdmin({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" replace />;
}

function AppRoutes() {
  const { user, admin } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          admin ? <Navigate to="/admin" replace /> :
          user ? <Navigate to="/home" replace /> :
          <Navigate to="/login" replace />
        } />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />
        <Route path="/admin/login" element={admin ? <Navigate to="/admin" replace /> : <AdminLogin />} />

        <Route path="/home" element={<ProtectedUser><Home /></ProtectedUser>} />
        <Route path="/weather" element={<ProtectedUser><Weather /></ProtectedUser>} />
        <Route path="/crop-advisor" element={<ProtectedUser><CropAdvisor /></ProtectedUser>} />
        <Route path="/community" element={<ProtectedUser><Community /></ProtectedUser>} />
        <Route path="/requests" element={<ProtectedUser><Requests /></ProtectedUser>} />

        <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/admin/requests" element={<ProtectedAdmin><AdminRequests /></ProtectedAdmin>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
