import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { useAuth } from '../context/AuthContext';
import { Activity, Flame, GlassWater, Trophy, Zap, Watch, ArrowRight, Check, X } from 'lucide-react';

export const Dashboard = ({ setTab }) => {
  const { user } = useAuth();
  const { 
    activeGoal, 
    workouts, 
    checkins, 
    nutritionLogs, 
    sleepLogs, 
    wearableState, 
    syncWearableData, 
    toggleCheckIn 
  } = useFitness();

  const [syncDevice, setSyncDevice] = useState('Apple Watch');
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    syncWearableData(syncDevice);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  // Helper for check-ins calendar (generating current week)
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    // Start of current week (Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(startOfWeek);
      nextDate.setDate(startOfWeek.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate daily aggregates for today (YYYY-MM-DD)
  const getDailyTotals = () => {
    const todayLog = nutritionLogs.filter(n => n.date === todayStr);
    const water = todayLog.reduce((acc, curr) => acc + (curr.waterIntake || 0), 0);
    const calories = todayLog.reduce((acc, curr) => {
      const foodCal = curr.foods ? curr.foods.reduce((sum, f) => sum + f.calories, 0) : 0;
      return acc + foodCal;
    }, 0);

    const todaySleep = sleepLogs.find(s => s.date === todayStr);
    const sleep = todaySleep ? todaySleep.duration : 0;

    return { water, calories, sleep };
  };

  const totals = getDailyTotals();

  // Active goal progress percentage
  const calculateGoalProgress = () => {
    if (!activeGoal || !user || !user.weight) return 0;
    const start = activeGoal.startWeight;
    const target = activeGoal.targetWeight;
    const current = user.weight;

    if (start === target) return 100;
    
    let progress = 0;
    if (activeGoal.goalType === 'weight_loss') {
      progress = ((start - current) / (start - target)) * 100;
    } else if (activeGoal.goalType === 'weight_gain') {
      progress = ((current - start) / (target - start)) * 100;
    } else {
      progress = 50; // generic muscle building/endurance defaults
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
  };

  const goalProgress = calculateGoalProgress();

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel responsive-welcome-banner">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome back, <span className="text-gradient-cyan-violet">{user?.name || 'Athlete'}</span>!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Your fitness parameters are looking strong. Track goals, meals, and sleep cycles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap style={{ color: 'var(--color-amber)' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>STREAK</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{user?.streakCount || 0} Days</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy style={{ color: 'var(--color-cyan)' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>LEVEL POINTS</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{user?.points || 0} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2-1">
        {/* Left Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Daily Gym Check-In Row */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏋️ Daily Gym Check-In Tracker
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', marginBottom: '16px' }}>
              Check in daily to build your active habit streak and earn points. Click date checkbox to toggle checkin.
            </p>
            
            <div className="checkin-grid">
              {weekDates.map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0];
                const isChecked = checkins.some(c => c.date === dateStr);
                const isToday = dateStr === todayStr;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();

                return (
                  <div 
                    key={idx}
                    className={`checkin-day ${isChecked ? 'checked' : ''} ${isToday ? 'glow-hover' : ''}`}
                    onClick={() => toggleCheckIn(dateStr)}
                    style={{
                      border: isToday && !isChecked ? '1px dashed var(--color-cyan)' : undefined,
                      boxShadow: isChecked ? '0 0 10px rgba(16, 185, 129, 0.2)' : undefined
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {dayName}
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>
                      {dayNum}
                    </span>
                    
                    {/* Checkbox like cross symbol that toggles */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isChecked ? 'var(--color-emerald)' : 'rgba(255, 255, 255, 0.05)',
                      border: isChecked ? '1px solid var(--color-emerald)' : '1px solid var(--border-glass)',
                      marginTop: '4px',
                      transition: 'all 0.2s ease'
                    }}>
                      {isChecked ? (
                        <Check size={12} color="#000" style={{ strokeWidth: 3 }} />
                      ) : (
                        <X size={12} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="responsive-grid-3col">
            {/* Calories Ring */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Flame size={24} style={{ color: 'var(--color-rose)', marginBottom: '12px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>CALORIES INTAKE</span>
              <span style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>{totals.calories} kcal</span>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totals.calories / (user?.targetCalories || 2000)) * 100)}%`, height: '100%', background: 'var(--color-rose)' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Target: {user?.targetCalories || 2000} kcal</span>
            </div>


            {/* Water Tracker */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GlassWater size={24} style={{ color: 'var(--color-cyan)', marginBottom: '12px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>WATER CONSUMED</span>
              <span style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>{totals.water} ml</span>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totals.water / (user?.targetWater || 3000)) * 100)}%`, height: '100%', background: 'var(--color-cyan)' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Target: {user?.targetWater || 3000} ml</span>
            </div>

            {/* Sleep tracker */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Activity size={24} style={{ color: 'var(--color-violet)', marginBottom: '12px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>SLEEP TRACKED</span>
              <span style={{ fontSize: '22px', fontWeight: 700, margin: '8px 0' }}>{totals.sleep} Hrs</span>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totals.sleep / 8) * 100)}%`, height: '100%', background: 'var(--color-violet)' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Target: 8.0 Hrs</span>
            </div>
          </div>

          {/* Active Goal Board */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>🎯 Target Fitness Goal</h3>
            {activeGoal ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(6, 182, 212, 0.12)',
                      color: 'var(--color-cyan)',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {activeGoal.goalType.replace('_', ' ')}
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '15px' }}>
                      Start weight: <strong>{activeGoal.startWeight}kg</strong> &rarr; Target weight: <strong>{activeGoal.targetWeight}kg</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-cyan)' }}>{goalProgress}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ACHIEVEMENT</div>
                  </div>
                </div>

                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${goalProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-cyan), var(--color-violet))' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>Target Date: {new Date(activeGoal.targetDate).toLocaleDateString()}</span>
                  <span>{user?.weight ? `Current weight: ${user.weight}kg` : 'No current weight logged'}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>You do not have any active fitness goals set yet.</p>
                <button className="btn-primary" onClick={() => setTab('goals')}>Set Fitness Goal</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Wearable Sync Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Watch size={20} className="text-gradient-cyan-violet" /> Sync Smart Wearables
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>SELECT BAND/WATCH</label>
              <select 
                className="form-input" 
                value={syncDevice} 
                onChange={(e) => setSyncDevice(e.target.value)}
                disabled={syncing}
              >
                <option value="Apple Watch">Apple Watch Series Ultra</option>
                <option value="Fitbit">Fitbit Charge 6</option>
                <option value="Garmin">Garmin Fenix 7X</option>
              </select>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Connecting...' : 'Sync Device Data'}
            </button>

            {wearableState.synced && (
              <div className="animate-fade-in" style={{
                marginTop: '16px',
                padding: '14px',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                borderRadius: '10px',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--color-cyan)', marginBottom: '8px' }}>Imported metrics:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Steps:</span><strong>{wearableState.steps.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Heart Rate:</span><strong>{wearableState.heartRate} bpm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>Calorie Burn:</span><strong>{wearableState.caloriesBurned} kcal</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingTop: '6px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Synced: {wearableState.syncTime}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '14px' }}>Quick Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                className="nav-item" 
                onClick={() => setTab('workouts')}
                style={{ background: 'rgba(255,255,255,0.02)', margin: 0, justifyContent: 'space-between' }}
              >
                <span>Log Manual Workout</span>
                <ArrowRight size={16} />
              </div>
              <div 
                className="nav-item" 
                onClick={() => setTab('nutrition')}
                style={{ background: 'rgba(255,255,255,0.02)', margin: 0, justifyContent: 'space-between' }}
              >
                <span>Log Meal / Water</span>
                <ArrowRight size={16} />
              </div>
              <div 
                className="nav-item" 
                onClick={() => setTab('sleep')}
                style={{ background: 'rgba(255,255,255,0.02)', margin: 0, justifyContent: 'space-between' }}
              >
                <span>Record Sleep Cycle</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
