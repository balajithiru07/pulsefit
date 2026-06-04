import React, { useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Users, DollarSign, Dumbbell, ShieldAlert, CheckCircle, Ban } from 'lucide-react';

export const AdminDashboard = () => {
  const { adminUsers, adminStats, toggleUserStatus, fetchAdminData } = useFitness();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const stats = adminStats?.metrics || {
    totalUsers: 0,
    premiumUsers: 0,
    totalWorkouts: 0,
    totalCheckins: 0,
    totalRevenue: 0.00
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '24px' }}>🛡️ Platform Admin Management</h2>

      {/* Grid counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '10px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TOTAL ATHLETES</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-violet)', borderRadius: '10px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>${stats.totalRevenue.toFixed(2)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>MOCK REVENUE</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-rose)', borderRadius: '10px' }}>
            <Dumbbell size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalWorkouts}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>WORKOUTS LOGGED</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)', borderRadius: '10px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{stats.totalCheckins}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GYM CHECK-INS</div>
          </div>
        </div>
      </div>

      {/* User listing panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Registered Platform Users</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Tier</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Streaks</th>
                <th style={{ padding: '12px' }}>XP Points</th>
                <th style={{ padding: '12px' }}>Account Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>{u.name || 'No profile name'}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: u.subscriptionStatus === 'premium' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.04)',
                      color: u.subscriptionStatus === 'premium' ? 'var(--color-cyan)' : 'var(--text-secondary)'
                    }}>
                      {u.subscriptionStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '16px 12px' }}>🔥 {u.streakCount} days</td>
                  <td style={{ padding: '16px 12px', fontWeight: 700 }}>{u.points} XP</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ color: u.isActive !== false ? 'var(--color-emerald)' : 'var(--color-rose)', fontWeight: 600 }}>
                      {u.isActive !== false ? 'Active' : 'Banned / Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <button
                      className="btn-secondary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '11px', 
                        color: u.isActive !== false ? 'var(--color-rose)' : 'var(--color-emerald)',
                        borderColor: u.isActive !== false ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
                        borderRadius: '6px'
                      }}
                      onClick={() => toggleUserStatus(u._id)}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
