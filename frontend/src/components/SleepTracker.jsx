import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Star, Moon, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export const SleepTracker = () => {
  const { sleepLogs, addSleep } = useFitness();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [quality, setQuality] = useState(4);
  const [deep, setDeep] = useState(25);
  const [light, setLight] = useState(50);
  const [rem, setRem] = useState(25);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!duration || !quality || !date) return;

    // Validate that stages add up to 100%
    const totalStages = Number(deep) + Number(light) + Number(rem);
    if (totalStages !== 100) {
      alert('Error: Sleep stage percentages must total exactly 100%.');
      return;
    }

    const success = await addSleep({
      duration: Number(duration),
      quality: Number(quality),
      stages: { deep: Number(deep), light: Number(light), rem: Number(rem) },
      date
    });

    if (success) {
      setDuration('');
    }
  };

  // Average quality calculation
  const getAvgSleepStats = () => {
    if (sleepLogs.length === 0) return { avgHours: 0, avgQuality: 0 };
    const totalHrs = sleepLogs.reduce((acc, curr) => acc + curr.duration, 0);
    const totalQual = sleepLogs.reduce((acc, curr) => acc + curr.quality, 0);
    return {
      avgHours: Math.round((totalHrs / sleepLogs.length) * 10) / 10,
      avgQuality: Math.round((totalQual / sleepLogs.length) * 10) / 10
    };
  };

  const avgStats = getAvgSleepStats();

  return (
    <div className="animate-fade-in responsive-grid-1-2">
      
      {/* Logger Form */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Moon className="text-gradient-cyan-violet" /> Record Sleep Session
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>DURATION (HOURS)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 7.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>DATE</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Star Rating Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>SLEEP QUALITY</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  onClick={() => setQuality(star)}
                  style={{
                    cursor: 'pointer',
                    fill: star <= quality ? 'var(--color-amber)' : 'none',
                    color: star <= quality ? 'var(--color-amber)' : 'var(--text-muted)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Sleep Stages Slider/Inputs */}
          <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
              SLEEP CYCLES STAGES (MUST SUM TO 100%)
            </label>
            
            <div className="responsive-grid-3col" style={{ gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DEEP (%)</label>
                <input type="number" className="form-input" value={deep} onChange={(e) => setDeep(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LIGHT (%)</label>
                <input type="number" className="form-input" value={light} onChange={(e) => setLight(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>REM (%)</label>
                <input type="number" className="form-input" value={rem} onChange={(e) => setRem(e.target.value)} required />
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '11px', color: Number(deep) + Number(light) + Number(rem) === 100 ? 'var(--color-emerald)' : 'var(--color-rose)', marginTop: '8px' }}>
              Current sum: {Number(deep) + Number(light) + Number(rem)}%
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
            Log Sleep Details
          </button>
        </form>
      </div>

      {/* Sleep Reports View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Aggregates Dashboard */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={20} className="text-gradient-cyan-violet" /> Sleep Cycles Analysis
          </h3>
          <div className="responsive-grid-2col" style={{ gap: '20px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-cyan)' }}>{avgStats.avgHours} Hrs</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Avg Sleep Duration</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-amber)' }}>{avgStats.avgQuality} / 5</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Avg Sleep Rating</div>
            </div>
          </div>
        </div>

        {/* History list */}
        <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>📅 Recent Sleep Logs</h3>
          
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {sleepLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                <Sparkles size={28} style={{ strokeWidth: 1.5, marginBottom: '8px' }} />
                No sleep cycles logged yet.
              </div>
            ) : (
              sleepLogs.map((s, idx) => (
                <div 
                  key={s._id || idx} 
                  style={{ 
                    padding: '14px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <strong style={{ fontSize: '14px' }}>{new Date(s.date).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          style={{ 
                            fill: star <= s.quality ? 'var(--color-amber)' : 'none', 
                            color: star <= s.quality ? 'var(--color-amber)' : 'var(--text-muted)' 
                          }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span>Duration: <strong>{s.duration} hrs</strong></span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Deep: {s.stages?.deep}% | Light: {s.stages?.light}% | REM: {s.stages?.rem}%
                    </span>
                  </div>

                  {/* Dynamic stacked progress bar showing distribution */}
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ width: `${s.stages?.deep || 0}%`, background: 'var(--color-violet)' }} title="Deep Sleep"></div>
                    <div style={{ width: `${s.stages?.light || 0}%`, background: 'var(--color-cyan)' }} title="Light Sleep"></div>
                    <div style={{ width: `${s.stages?.rem || 0}%`, background: 'var(--color-rose)' }} title="REM Sleep"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
