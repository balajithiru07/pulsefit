import React, { useState, useMemo } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Search, 
  Calendar, 
  Trash2, 
  Clock, 
  Dumbbell, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Sparkles,
  Layers,
  Activity,
  CalendarRange
} from 'lucide-react';

export const WorkoutRecords = () => {
  const { workouts, deleteWorkout } = useFitness();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('all'); // 'all', '7days', '30days', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State for collapsible dates
  const [expandedDates, setExpandedDates] = useState({});

  // Reset custom dates helper
  const handlePresetChange = (preset) => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filter and compute workouts list
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = w.exerciseName.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // 2. Date Range Filter
      const workoutDate = new Date(w.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // end of today

      if (dateRangePreset === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
      } 
      
      if (dateRangePreset === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return workoutDate >= thirtyDaysAgo && workoutDate <= today;
      }

      if (dateRangePreset === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return workoutDate >= startOfMonth && workoutDate <= today;
      }

      if (dateRangePreset === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (workoutDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (workoutDate > end) return false;
        }
      }

      return true;
    });
  }, [workouts, searchQuery, dateRangePreset, startDate, endDate]);

  // Group workouts by date
  const groupedWorkouts = useMemo(() => {
    const groups = {};
    
    filteredWorkouts.forEach(w => {
      let dateStr;
      try {
        dateStr = new Date(w.date).toISOString().split('T')[0];
      } catch (err) {
        dateStr = w.date || new Date().toISOString().split('T')[0];
      }

      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          workouts: [],
          totalDuration: 0,
          totalVolume: 0,
          totalSets: 0
        };
      }

      groups[dateStr].workouts.push(w);
      groups[dateStr].totalDuration += w.duration || 0;
      
      // Calculate workout volume (reps * weight) and sets count
      let workoutVolume = 0;
      if (w.sets && Array.isArray(w.sets)) {
        w.sets.forEach(s => {
          workoutVolume += (s.reps || 0) * (s.weight || 0);
        });
        groups[dateStr].totalSets += w.sets.length;
      }
      groups[dateStr].totalVolume += workoutVolume;
    });

    // Convert to sorted array (descending dates)
    return Object.values(groups).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [filteredWorkouts]);

  // Overall statistics for the filtered selection
  const statistics = useMemo(() => {
    let totalVolume = 0;
    let totalDuration = 0;
    let totalSets = 0;
    const uniqueDates = new Set();

    filteredWorkouts.forEach(w => {
      totalDuration += w.duration || 0;
      
      let dateStr;
      try {
        dateStr = new Date(w.date).toISOString().split('T')[0];
      } catch (err) {
        dateStr = w.date || new Date().toISOString().split('T')[0];
      }
      uniqueDates.add(dateStr);

      if (w.sets && Array.isArray(w.sets)) {
        totalSets += w.sets.length;
        w.sets.forEach(s => {
          totalVolume += (s.reps || 0) * (s.weight || 0);
        });
      }
    });

    return {
      workoutsCount: filteredWorkouts.length,
      activeDays: uniqueDates.size,
      totalVolume,
      totalDuration,
      totalSets
    };
  }, [filteredWorkouts]);

  const toggleExpandDate = (dateStr) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateStr]: prev[dateStr] === false ? true : false // default is expanded (undefined / true)
    }));
  };

  const handleExpandAll = () => {
    const newExpanded = {};
    groupedWorkouts.forEach(g => {
      newExpanded[g.date] = true;
    });
    setExpandedDates(newExpanded);
  };

  const handleCollapseAll = () => {
    const newExpanded = {};
    groupedWorkouts.forEach(g => {
      newExpanded[g.date] = false;
    });
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      // Parse UTC date string correctly avoiding timezone shift
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return new Date(dateStr).toLocaleDateString('en-US', options);
    }
  };

  // Helper to calculate total volume for a single workout entry
  const getWorkoutVolume = (sets) => {
    if (!sets || !Array.isArray(sets)) return 0;
    return sets.reduce((acc, s) => acc + (s.reps || 0) * (s.weight || 0), 0);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarRange style={{ color: 'var(--color-cyan)' }} /> Daily Workout Journal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Track your strength progression, active minutes, and total volume lift grouped by calendar days.
          </p>
        </div>

        {groupedWorkouts.length > 1 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }} onClick={handleExpandAll}>
              Expand All
            </button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }} onClick={handleCollapseAll}>
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Analytics Stats Grid */}
      <div className="responsive-grid-4col" style={{ marginBottom: '28px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(225, 29, 72, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-cyan)'
          }}>
            <Dumbbell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Exercises</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{statistics.workoutsCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(159, 18, 57, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-violet)'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Days</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{statistics.activeDays}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(5, 150, 105, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-emerald)'
          }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Volume</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statistics.totalVolume.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>kg</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(217, 119, 6, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-amber)'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Duration</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statistics.totalDuration} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>mins</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Row: Search & Presets */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search exercise name..."
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Presets Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Time' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'custom', label: 'Custom Range' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={dateRangePreset === preset.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  onClick={() => handlePresetChange(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible custom date range row */}
          {dateRangePreset === 'custom' && (
            <div className="responsive-grid-2col animate-fade-in" style={{ gap: '16px', background: 'rgba(0,0,0,0.01)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>START DATE</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>END DATE</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Grouped Logs Container */}
      <div>
        {groupedWorkouts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={44} style={{ strokeWidth: 1.5, marginBottom: '16px', color: 'var(--text-muted)' }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>No Workout Entries Found</h4>
            <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto' }}>
              {searchQuery || dateRangePreset !== 'all' 
                ? "Try clearing your filters or adjustments on search query to see other logs."
                : "You haven't logged any workouts yet. Head over to the Workouts tab to log your manual entry."}
            </p>
          </div>
        ) : (
          groupedWorkouts.map(group => {
            const isExpanded = expandedDates[group.date] !== false; // default is expanded
            
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
                {/* Accordion Trigger Header */}
                <div 
                  onClick={() => toggleExpandDate(group.date)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Calendar size={18} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} /> {formatDate(group.date)}
                    </h4>
                    
                    {/* Inline Day summary pills */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(225,29,72,0.06)', color: 'var(--color-cyan)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={11} /> {group.workouts.length} {group.workouts.length === 1 ? 'Exercise' : 'Exercises'}
                      </span>
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(217,119,6,0.06)', color: 'var(--color-amber)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {group.totalDuration} mins
                      </span>
                      {group.totalVolume > 0 && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(5,150,105,0.06)', color: 'var(--color-emerald)', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={11} /> {group.totalVolume.toLocaleString()} kg Volume
                        </span>
                      )}
                      <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                        Sets: <strong>{group.totalSets}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Collapsible Card Body */}
                {isExpanded && (
                  <div 
                    style={{ 
                      marginTop: '16px', 
                      paddingTop: '16px', 
                      borderTop: '1px solid rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {group.workouts.map(w => {
                      const workoutVolume = getWorkoutVolume(w.sets);
                      
                      return (
                        <div 
                          key={w._id} 
                          style={{ 
                            padding: '16px',
                            background: 'rgba(0, 0, 0, 0.01)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <h5 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{w.exerciseName}</h5>
                              <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} /> {w.duration}m
                              </span>
                              {workoutVolume > 0 && (
                                <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(5,150,105,0.04)', color: 'var(--color-emerald)', borderRadius: '4px', fontWeight: 600 }}>
                                  Volume: {workoutVolume.toLocaleString()} kg
                                </span>
                              )}
                            </div>

                            {/* Sets pill list */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                              {w.sets.map((set, sIdx) => (
                                <span 
                                  key={sIdx} 
                                  style={{ 
                                    fontSize: '11px', 
                                    padding: '4px 8px', 
                                    background: 'rgba(255,255,255,0.8)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    gap: '4px',
                                    color: 'var(--text-primary)'
                                  }}
                                >
                                  <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>#{sIdx + 1}</span>
                                  <span>{set.reps} reps</span>
                                  <span style={{ color: 'var(--text-muted)' }}>@</span>
                                  <strong>{set.weight}kg</strong>
                                </span>
                              ))}
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => deleteWorkout(w._id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--color-rose)', 
                              cursor: 'pointer', 
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete this entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
