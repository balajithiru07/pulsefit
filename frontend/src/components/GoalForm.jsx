import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Target, Trash, Calendar, ArrowRight } from 'lucide-react';

export const GoalForm = () => {
  const { goals, addGoal, deleteGoal } = useFitness();

  const [goalType, setGoalType] = useState('weight_loss');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startWeight || !targetWeight || !targetDate) return;

    setLoading(true);
    const success = await addGoal({
      goalType,
      startWeight: Number(startWeight),
      targetWeight: Number(targetWeight),
      targetDate
    });
    setLoading(false);

    if (success) {
      setStartWeight('');
      setTargetWeight('');
      setTargetDate('');
    }
  };

  return (
    <div className="animate-fade-in responsive-grid-2col">
      
      {/* Logger Form */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target className="text-gradient-cyan-violet" /> Configure Target Goal
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>GOAL OBJECTIVE</label>
            <select className="form-input" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_building">Muscle Building</option>
              <option value="endurance">Endurance Improvement</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>START WEIGHT (KG)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 80"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>TARGET WEIGHT (KG)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 75"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>TARGET DEADLINE DATE</label>
            <input
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Configuring...' : 'Set Active Goal'}
          </button>
        </form>
      </div>

      {/* Goals History list */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>🎯 Goals History</h3>
        
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
          {goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No target goals configured yet.
            </div>
          ) : (
            goals.map((g) => (
              <div 
                key={g._id} 
                style={{ 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '12px',
                  marginBottom: '12px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: 'rgba(6,182,212,0.1)',
                    color: 'var(--color-cyan)',
                    textTransform: 'uppercase'
                  }}>
                    {g.goalType.replace('_', ' ')}
                  </span>
                  <button 
                    onClick={() => deleteGoal(g._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}
                  >
                    <Trash size={15} />
                  </button>
                </div>

                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                  Weight: <strong>{g.startWeight}kg</strong> &rarr; <strong>{g.targetWeight}kg</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Calendar size={12} /> Target: {new Date(g.targetDate).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
