import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { WorkoutLog } from './components/WorkoutLog';
import { NutritionLog } from './components/NutritionLog';
import { SleepTracker } from './components/SleepTracker';
import { AICoach } from './components/AICoach';
import { SocialHub } from './components/SocialHub';
import { Billing } from './components/Billing';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileForm } from './components/ProfileForm';
import { NutritionHistory } from './components/NutritionHistory';
import { GoalForm } from './components/GoalForm';

import { 
  Dumbbell, 
  LayoutDashboard, 
  Utensils, 
  Moon, 
  MessageSquare, 
  Trophy, 
  CreditCard, 
  ShieldAlert, 
  User, 
  LogOut, 
  Sparkles,
  CalendarRange,
  Target
} from 'lucide-react';

function App() {
  const { user, token, loading, toastMessage, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'forgot'
  const [tab, setTab] = useState('dashboard'); // 'dashboard', 'workouts', etc.

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '12px'
      }}>
        <Dumbbell size={36} className="text-gradient-cyan-violet" style={{ animation: 'spin 2s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>PULSEFIT BOOTING...</span>
      </div>
    );
  }

  // Auth Guard
  if (!token || !user) {
    return <Auth currentView={authView} setView={setAuthView} />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="app-container">
      {/* Toast Alert Popups */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast animate-fade-in" style={{
            borderLeftColor: toastMessage.type === 'error' ? 'var(--color-rose)' : 'var(--color-cyan)',
            boxShadow: toastMessage.type === 'error' ? '0 0 15px rgba(244,63,94,0.2)' : '0 0 15px rgba(6,182,212,0.2)'
          }}>
            <Sparkles size={16} style={{ color: toastMessage.type === 'error' ? 'var(--color-rose)' : 'var(--color-cyan)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Glassmorphic Navigation Sidebar */}
      <aside className="sidebar">
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <Dumbbell size={24} className="text-gradient-cyan-violet" style={{ strokeWidth: 2.5 }} />
          <h2 className="text-gradient-cyan-violet" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>PULSEFIT</h2>
        </div>

        {/* User Quick Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '32px' }}>{user.profilePic || '🦊'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name || 'Athlete'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              {user.subscriptionStatus === 'premium' ? '👑 Premium Partner' : 'Free Account'}
            </div>
          </div>
        </div>

        {/* Links */}
        <nav style={{ flex: 1 }}>
          <div className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div className={`nav-item ${tab === 'goals' ? 'active' : ''}`} onClick={() => setTab('goals')}>
            <Target size={18} />
            <span>Target Goal</span>
          </div>

          <div className={`nav-item ${tab === 'workouts' ? 'active' : ''}`} onClick={() => setTab('workouts')}>
            <Dumbbell size={18} />
            <span>Workouts</span>
          </div>

          <div className={`nav-item ${tab === 'nutrition' ? 'active' : ''}`} onClick={() => setTab('nutrition')}>
            <Utensils size={18} />
            <span>Nutrition & Water</span>
          </div>

          <div className={`nav-item ${tab === 'nutrition_history' ? 'active' : ''}`} onClick={() => setTab('nutrition_history')}>
            <CalendarRange size={18} />
            <span>Nutrition History</span>
          </div>

          <div className={`nav-item ${tab === 'sleep' ? 'active' : ''}`} onClick={() => setTab('sleep')}>
            <Moon size={18} />
            <span>Sleep Log</span>
          </div>

          <div className={`nav-item ${tab === 'coach' ? 'active' : ''}`} onClick={() => setTab('coach')}>
            <MessageSquare size={18} />
            <span>AI Fitness Coach</span>
          </div>

          <div className={`nav-item ${tab === 'challenges' ? 'active' : ''}`} onClick={() => setTab('challenges')}>
            <Trophy size={18} />
            <span>Challenges Hub</span>
          </div>

          <div className={`nav-item ${tab === 'billing' ? 'active' : ''}`} onClick={() => setTab('billing')}>
            <CreditCard size={18} />
            <span>Pricing & Billing</span>
          </div>

          <div className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            <User size={18} />
            <span>Profile metrics</span>
          </div>

          {/* Admin panel conditionally visible */}
          {isAdmin && (
            <div className={`nav-item ${tab === 'admin' ? 'active' : ''}`} onClick={() => setTab('admin')} style={{ borderLeft: '3px solid var(--color-rose)' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-rose)' }} />
              <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>Admin Console</span>
            </div>
          )}
        </nav>

        {/* Bottom items */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <div className="nav-item" onClick={logout} style={{ color: 'var(--color-rose)', marginBottom: 0 }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Body view wrapper */}
      <main className="main-content">
        {tab === 'dashboard' && <Dashboard setTab={setTab} />}
        {tab === 'workouts' && <WorkoutLog />}
        {tab === 'goals' && <GoalForm />}
        {tab === 'nutrition' && <NutritionLog />}
        {tab === 'nutrition_history' && <NutritionHistory />}
        {tab === 'sleep' && <SleepTracker />}
        {tab === 'coach' && <AICoach setTab={setTab} />}
        {tab === 'challenges' && <SocialHub />}
        {tab === 'billing' && <Billing />}
        {tab === 'profile' && <ProfileForm />}
        {tab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

    </div>
  );
}

export default App;
