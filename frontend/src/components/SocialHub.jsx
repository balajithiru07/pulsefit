import React from 'react';
import { useFitness } from '../context/FitnessContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, ShieldAlert, Award, User, Target, Flame, Users, Check } from 'lucide-react';

// Mock Leaderboard users list
const MOCK_LEADERBOARD = [
  { name: 'Alex Cooper', points: 1250, streak: 12, avatar: '🦊' },
  { name: 'Sarah Miller', points: 980, streak: 8, avatar: '🐯' },
  { name: 'David Lee', points: 740, streak: 5, avatar: '🐨' },
  { name: 'Emily Davis', points: 610, streak: 3, avatar: '🦁' }
];

export const SocialHub = () => {
  const { user } = useAuth();
  const { challenges, joinChallenge, completeChallenge } = useFitness();

  const userPoints = user?.points || 0;
  const userStreak = user?.streakCount || 0;
  const username = user?.name || user?.email.split('@')[0] || 'You';

  // Construct complete leaderboard including user
  const leaderboard = [
    ...MOCK_LEADERBOARD,
    { name: `${username} (You)`, points: userPoints, streak: userStreak, avatar: '⚡', isMe: true }
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="animate-fade-in responsive-grid-1-2">
      
      {/* Left Column: Gamified Challenges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Streak and Badges */}
        <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award className="text-gradient-cyan-violet" /> Your Achievements & Badges
          </h3>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {user?.badges && user.badges.length > 0 ? (
              user.badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <span>🏅</span> {badge}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', padding: '10px 0' }}>
                No badges unlocked yet. Join challenges or post updates to claim your first badge!
              </div>
            )}
          </div>
        </div>

        {/* Active Challenges List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} className="text-gradient-cyan-violet" /> Gamified Habit Challenges
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {challenges.map((c) => {
              const hasJoined = c.participants.includes(user?._id?.toString());
              const isCompleted = c.completedUsers.includes(user?._id?.toString());

              return (
                <div 
                  key={c._id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: isCompleted ? 'var(--color-emerald)' : hasJoined ? 'var(--color-cyan)' : 'var(--border-glass)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '15px' }}>{c.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.description}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <span>Award: <strong>+{c.points} XP</strong></span>
                      <span>&bull;</span>
                      <span>Type: <strong>{c.metric.toUpperCase()} Target</strong></span>
                    </div>
                  </div>

                  <div>
                    {!hasJoined ? (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => joinChallenge(c._id)}
                      >
                        Join Challenge
                      </button>
                    ) : isCompleted ? (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: 'var(--color-emerald)', 
                        fontSize: '13px', 
                        fontWeight: 700 
                      }}>
                        <Check size={14} /> Completed
                      </span>
                    ) : (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--color-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        onClick={() => completeChallenge(c._id)}
                      >
                        Claim Points
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: Leaderboard */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} className="text-gradient-cyan-violet" /> Global Ranking Leaderboard
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaderboard.map((u, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: u.isMe ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.01)',
                border: u.isMe ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-glass)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: '14px', 
                  color: idx === 0 ? 'var(--color-amber)' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : 'var(--text-muted)',
                  width: '20px'
                }}>
                  #{idx + 1}
                </span>
                <span style={{ fontSize: '20px' }}>{u.avatar}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: u.isMe ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={10} style={{ color: 'var(--color-rose)' }} /> {u.streak} day streak
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: u.isMe ? 'var(--color-cyan)' : 'var(--text-primary)' }}>
                  {u.points}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
