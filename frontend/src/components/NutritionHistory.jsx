import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Trash, Calendar, CalendarRange, Flame, GlassWater, ChevronDown, ChevronUp, Dumbbell, Clock } from 'lucide-react';

export const NutritionHistory = () => {
  const { nutritionLogs, deleteNutrition, workouts, deleteWorkout } = useFitness();
  const [expandedDates, setExpandedDates] = useState({});

  const toggleExpand = (dateStr) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  // Group nutrition & workouts by date
  const getGroupedLogs = () => {
    const groups = {};

    // Group nutrition
    nutritionLogs.forEach(log => {
      const dateStr = log.date;
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          meals: [],
          workouts: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0,
          workoutDuration: 0
        };
      }

      groups[dateStr].meals.push(log);
      groups[dateStr].water += log.waterIntake || 0;

      if (log.foods) {
        log.foods.forEach(f => {
          groups[dateStr].calories += f.calories || 0;
          groups[dateStr].protein += f.protein || 0;
          groups[dateStr].carbs += f.carbs || 0;
          groups[dateStr].fat += f.fat || 0;
        });
      }
    });

    // Group workouts
    workouts.forEach(w => {
      let dateStr;
      try {
        dateStr = new Date(w.date).toISOString().split('T')[0];
      } catch (err) {
        dateStr = w.date || new Date().toISOString().split('T')[0];
      }

      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          meals: [],
          workouts: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0,
          workoutDuration: 0
        };
      }

      groups[dateStr].workouts.push(w);
      groups[dateStr].workoutDuration += w.duration || 0;
    });

    // Convert to sorted array (descending dates)
    const sortedGroups = Object.values(groups).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return sortedGroups;
  };

  const groupedLogs = getGroupedLogs();

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700 }}>📅 Daily Activity & Diet Journal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            A unified view of your logged workouts, daily macro balances, and water consumption grouped by date.
          </p>
        </div>
      </div>

      {groupedLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CalendarRange size={48} style={{ strokeWidth: 1.5, marginBottom: '16px', color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '15px' }}>No activity records logged in this session.</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Start by logging workouts or meals in their respective tabs.</p>
        </div>
      ) : (
        groupedLogs.map(group => {
          const isExpanded = expandedDates[group.date] !== false; // default to expanded
          
          return (
            <div 
              key={group.date} 
              className="glass-panel glow-hover" 
              style={{ 
                padding: '20px 24px', 
                marginBottom: '20px', 
                borderLeft: '4px solid var(--color-cyan)',
                background: 'var(--bg-card)' 
              }}
            >
              {/* Card Header Accordion */}
              <div 
                onClick={() => toggleExpand(group.date)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer' 
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--color-cyan)' }} /> {formatDate(group.date)}
                  </h4>
                  
                  {/* Summary pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {group.workoutDuration > 0 && (
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(6,182,212,0.1)', color: 'var(--color-cyan)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Dumbbell size={11} /> {group.workoutDuration} mins Workout
                      </span>
                    )}
                    {group.calories > 0 && (
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(244,63,94,0.1)', color: 'var(--color-rose)', borderRadius: '6px', fontWeight: 600 }}>
                        🔥 {group.calories} kcal
                      </span>
                    )}
                    {(group.protein > 0 || group.carbs > 0 || group.fat > 0) && (
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                        Macros: P:<strong>{group.protein}g</strong> C:<strong>{group.carbs}g</strong> F:<strong>{group.fat}g</strong>
                      </span>
                    )}
                    {group.water > 0 && (
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(139,92,246,0.1)', color: 'var(--color-violet)', borderRadius: '6px', fontWeight: 600 }}>
                        💧 {group.water} ml Water
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
                </div>
              </div>

              {/* Card Body - Details list */}
              {isExpanded && (
                <div 
                  className={group.workouts.length > 0 && group.meals.length > 0 ? "responsive-grid-2col" : ""}
                  style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    gap: '24px'
                  }}
                >
                  
                  {/* Workouts Details Section */}
                  {group.workouts.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Dumbbell size={14} /> Logged Workouts
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.workouts.map((w) => (
                          <div 
                            key={w._id} 
                            style={{ 
                              padding: '12px',
                              background: 'rgba(6, 182, 212, 0.03)',
                              border: '1px solid rgba(6, 182, 212, 0.12)',
                              borderRadius: '10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '13px' }}>{w.exerciseName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Clock size={11} /> {w.duration} mins
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                {w.sets.map((set, sIdx) => (
                                  <span key={sIdx} style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                    {set.reps}r @ {set.weight}kg
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteWorkout(w._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer', padding: '6px' }}
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meals & Diet Details Section */}
                  {group.meals.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-rose)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flame size={14} /> Meals & Water Logs
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.meals.map((log) => (
                          <div 
                            key={log._id} 
                            style={{ 
                              padding: '12px',
                              background: 'rgba(244, 63, 94, 0.02)',
                              border: '1px solid rgba(244, 63, 94, 0.1)',
                              borderRadius: '10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '13px' }}>
                                {log.mealName}
                                {log.waterIntake > 0 && ` (+${log.waterIntake}ml Water)`}
                              </div>
                              {log.foods && log.foods.map((food, fIdx) => (
                                <div key={fIdx} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  &bull; {food.name} ({food.calories} cal){(food.protein > 0 || food.carbs > 0 || food.fat > 0) && ` • P: ${food.protein}g C: ${food.carbs}g F: ${food.fat}g`}
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => deleteNutrition(log._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer', padding: '6px' }}
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
};
