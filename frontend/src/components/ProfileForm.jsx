import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Activity, Edit2, Compass, AlertCircle, UtensilsCrossed } from 'lucide-react';

const MOCK_AVATARS = ['🦊', '🐯', '🐨', '🦁', '🦉', '⚡', '🤖', '👑', '👽', '🦄'];

export const ProfileForm = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [fitnessGoals, setFitnessGoals] = useState(user?.fitnessGoals || []);
  const [profilePic, setProfilePic] = useState(user?.profilePic || '🦊');
  
  // Custom Nutrition Targets states
  const [targetCalories, setTargetCalories] = useState(user?.targetCalories || 2000);
  const [targetProtein, setTargetProtein] = useState(user?.targetProtein || 150);
  const [targetCarbs, setTargetCarbs] = useState(user?.targetCarbs || 220);
  const [targetFat, setTargetFat] = useState(user?.targetFat || 65);
  const [targetWater, setTargetWater] = useState(user?.targetWater || 3000);

  const [loading, setLoading] = useState(false);

  const toggleGoal = (goal) => {
    setFitnessGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile({
      name,
      age: age ? Number(age) : null,
      gender,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      fitnessGoals,
      profilePic,
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      targetCarbs: Number(targetCarbs),
      targetFat: Number(targetFat),
      targetWater: Number(targetWater)
    });
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User className="text-gradient-cyan-violet" /> Profile & Health Parameters
      </h3>

      <form onSubmit={handleSubmit}>
        
        {/* Avatar Picker Widget */}
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>SELECT ATHLETE AVATAR</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {MOCK_AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setProfilePic(av)}
                style={{
                  fontSize: '28px',
                  background: profilePic === av ? 'rgba(225, 29, 72, 0.08)' : 'rgba(0,0,0,0.02)',
                  border: profilePic === av ? '2px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: profilePic === av ? '0 0 10px rgba(225,29,72,0.15)' : 'none'
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>ATHLETE NAME</label>
            <input type="text" className="form-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>AGE</label>
            <input type="number" className="form-input" placeholder="Years" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>

        {/* Health Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>GENDER</label>
            <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>HEIGHT (CM)</label>
            <input type="number" className="form-input" placeholder="e.g. 175" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>WEIGHT (KG)</label>
            <input type="number" className="form-input" placeholder="e.g. 72" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>

        {/* Nutrition Goals Configuration */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UtensilsCrossed size={16} className="text-gradient-cyan-violet" /> Daily Nutrition Goal Targets
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>CALORIES TARGET (KCAL)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetCalories} 
                onChange={(e) => setTargetCalories(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>WATER TARGET (ML)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetWater} 
                onChange={(e) => setTargetWater(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>PROTEIN TARGET (G)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetProtein} 
                onChange={(e) => setTargetProtein(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>CARBS TARGET (G)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetCarbs} 
                onChange={(e) => setTargetCarbs(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>FAT TARGET (G)</label>
              <input 
                type="number" 
                className="form-input" 
                value={targetFat} 
                onChange={(e) => setTargetFat(e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Goals Checklist */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>FITNESS INTERESTS / GOALS</label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { id: 'weight_loss', label: 'Weight loss' },
              { id: 'weight_gain', label: 'Weight gain' },
              { id: 'muscle_building', label: 'Muscle building' },
              { id: 'endurance', label: 'Endurance improvement' },
              { id: 'general_fitness', label: 'General fitness' }
            ].map((goal) => {
              const active = fitnessGoals.includes(goal.id);
              return (
                <div 
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    padding: '12px 16px',
                    background: active ? 'rgba(225, 29, 72, 0.05)' : 'rgba(0,0,0,0.01)',
                    border: active ? '1px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: active ? 'var(--color-cyan)' : 'var(--text-muted)',
                    background: active ? 'var(--color-cyan)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {active && <span style={{ fontSize: '10px', color: '#fff' }}>✓</span>}
                  </div>
                  {goal.label}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
          {loading ? 'Saving Parameters...' : 'Save Profile Details'}
        </button>

      </form>
    </div>
  );
};
