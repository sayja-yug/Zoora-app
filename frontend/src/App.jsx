import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { StartupDetailPage } from './pages/StartupDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import { FounderDashboardPage } from './pages/FounderDashboardPage';
import './index.css';
function isAuthenticated() {
    const token = localStorage.getItem('zoora_token');
    if (!token)
        return false;
    if (token.startsWith('eyJ') && token.endsWith('.mock'))
        return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    }
    catch {
        return false;
    }
}
function ProtectedRoute({ children }) {
    if (!isAuthenticated())
        return <Navigate to="/login" replace/>;
    return <>{children}</>;
}
function Navbar() {
    const navigate = useNavigate();
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('zoora_user') || '{}');
        }
        catch {
            return {};
        }
    })();
    function handleLogout() {
        localStorage.removeItem('zoora_token');
        localStorage.removeItem('zoora_user');
        navigate('/login');
    }
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(user.role === 'founder' ? '/founder' : '/')} style={{ cursor: 'pointer' }}>
        <div className="navbar-brand-dot"/>
        <span><span style={{ color: 'var(--color-cyan)' }}>Z</span>oora</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>
          {user.role === 'founder' ? 'Founder Portal' : 'Investor Portal'}
        </span>
      </div>

      <div className="navbar-actions">
        {user.role === 'founder' && (
          <>
            <button 
              className="btn btn-ghost" 
              onClick={() => navigate('/founder')} 
              style={{ fontSize: 12, marginRight: 8 }}
            >
              Dashboard
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={() => navigate('/')} 
              style={{ fontSize: 12, marginRight: 16, color: 'var(--color-cyan)' }}
            >
              Leaderboard
            </button>
          </>
        )}
        <div className="navbar-user">
          <div className="navbar-user-dot"/>
          <span>{user.email ?? 'Investor'}</span>
        </div>
        <button id="logout-btn" className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: 12 }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
function AppShell() {
    return (<div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>}/>
          <Route path="/founder" element={<ProtectedRoute><FounderDashboardPage /></ProtectedRoute>}/>
          <Route path="/startup/:id" element={<ProtectedRoute><StartupDetailPage /></ProtectedRoute>}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>
    </div>);
}
export default function App() {
    return (<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell />
    </BrowserRouter>);
}
