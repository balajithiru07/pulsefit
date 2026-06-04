import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Plus, Trash, Dumbbell, Calendar, Clock, Sparkles } from 'lucide-react';

export const WorkoutLog = () => {
  const { workouts, addWorkout, deleteWorkout } = useFitness();
  
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState([{ reps: 10, weight: 10 }]);

  const handleAddSet = () => {
    setSets(prev => [...prev, { reps: 10, weight: prev[prev.length - 1]?.weight || 10 }]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length === 1) return;
    setSets(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSetChange = (index, key, val) => {
    setSets(prev => prev.map((s, idx) => idx === index ? { ...s, [key]: val } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseName || !duration || sets.length === 0) return;

    const success = await addWorkout({
      exerciseName,
      sets,
      duration,
      date
    });

    if (success) {
      setExerciseName('');
      setDuration('');
      setSets([{ reps: 10, weight: 10 }]);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
      
      {/* Logger Form */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dumbbell className="text-gradient-cyan-violet" /> Manual Workout Logger
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>EXERCISE NAME</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Incline Bench Press, Squats"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>DURATION (MINS)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 45"
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

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>DYNAMIC SET STRUCTURE</label>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
                onClick={handleAddSet}
              >
                <Plus size={14} /> Add Set
              </button>
            </div>

            {sets.map((set, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40px 1fr 1fr 40px', 
                  gap: '12px', 
                  alignItems: 'center', 
                  marginBottom: '10px' 
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-cyan)', textAlign: 'center' }}>
                  #{idx + 1}
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Weight (kg)"
                    value={set.weight}
                    onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(idx)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--color-rose)', 
                      cursor: sets.length === 1 ? 'not-allowed' : 'pointer', 
                      opacity: sets.length === 1 ? 0.3 : 1 
                    }}
                    disabled={sets.length === 1}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
            Save Workout Entry
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>🏃 Activity History</h3>
        
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
          {workouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Sparkles size={36} style={{ strokeWidth: 1.5, marginBottom: '12px' }} />
              <p>No logged activities found.</p>
            </div>
          ) : (
            workouts.map((w, idx) => (
              <div 
                key={w._id || idx} 
                className="glass-panel glow-hover animate-fade-in" 
                style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  borderLeft: '4px solid var(--color-cyan)',
                  background: 'var(--bg-card)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '16px' }}>{w.exerciseName}</h4>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {new Date(w.date).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {w.duration} mins
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWorkout(w._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}
                  >
                    <Trash size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {w.sets.map((set, sIdx) => (
                    <span 
                      key={sIdx} 
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid var(--border-glass)', 
                        borderRadius: '6px' 
                      }}
                    >
                      Set {sIdx + 1}: <strong>{set.reps} reps</strong> @ <strong>{set.weight}kg</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
