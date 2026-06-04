import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const FitnessContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const FitnessProvider = ({ children }) => {
  const { token, user, showToast, updateProfile } = useAuth();
  
  const [goals, setGoals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [foods, setFoods] = useState([]);
  
  // Wearable simulation data state
  const [wearableState, setWearableState] = useState({
    synced: false,
    device: null,
    steps: 0,
    heartRate: 0,
    caloriesBurned: 0,
    syncTime: null
  });

  // Admin states
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  const [loading, setLoading] = useState(false);

  // Load everything when token changes
  useEffect(() => {
    if (token) {
      fetchFitnessData();
    }
  }, [token]);

  const fetchFitnessData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch goals
      const resGoals = await fetch(`${API_URL}/goals`, { headers });
      if (resGoals.ok) setGoals(await resGoals.ok ? await resGoals.json() : []);

      // Fetch workouts
      const resWorkouts = await fetch(`${API_URL}/workouts`, { headers });
      if (resWorkouts.ok) setWorkouts(await resWorkouts.json());

      // Fetch checkins
      const resCheckins = await fetch(`${API_URL}/checkins`, { headers });
      if (resCheckins.ok) setCheckins(await resCheckins.json());

      // Fetch nutrition
      const resNutrition = await fetch(`${API_URL}/nutrition`, { headers });
      if (resNutrition.ok) setNutritionLogs(await resNutrition.json());

      // Fetch sleep
      const resSleep = await fetch(`${API_URL}/sleep`, { headers });
      if (resSleep.ok) setSleepLogs(await resSleep.json());

      // Fetch challenges
      const resChallenges = await fetch(`${API_URL}/challenges`, { headers });
      if (resChallenges.ok) setChallenges(await resChallenges.json());

      // Fetch invoices
      const resInvoices = await fetch(`${API_URL}/payments/invoices`, { headers });
      if (resInvoices.ok) setInvoices(await resInvoices.json());

      // Fetch foods
      const resFoods = await fetch(`${API_URL}/foods`, { headers });
      if (resFoods.ok) setFoods(await resFoods.json());

      // If admin, fetch admin details
      if (user && user.role === 'admin') {
        fetchAdminData();
      }

    } catch (err) {
      console.error('Error loading fitness parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const resUsers = await fetch(`${API_URL}/admin/users`, { headers });
      if (resUsers.ok) setAdminUsers(await resUsers.json());

      const resStats = await fetch(`${API_URL}/admin/stats`, { headers });
      if (resStats.ok) setAdminStats(await resStats.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        fetchAdminData(); // reload
      }
    } catch (err) {
      showToast('Error changing user status', 'error');
    }
  };

  // Goals CRUD
  const addGoal = async (goalData) => {
    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals(prev => [newGoal, ...prev]);
        showToast('Fitness goal configured!');
        return true;
      }
    } catch (err) {
      showToast('Error creating goal', 'error');
    }
    return false;
  };

  const deleteGoal = async (id) => {
    try {
      const res = await fetch(`${API_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setGoals(prev => prev.filter(g => g._id !== id));
        showToast('Goal deleted.');
      }
    } catch (err) {
      showToast('Error removing goal', 'error');
    }
  };

  // Workouts
  const addWorkout = async (workoutData) => {
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workoutData)
      });
      if (res.ok) {
        const newW = await res.json();
        setWorkouts(prev => [newW, ...prev]);
        showToast('Workout logged! Keep it up!');
        
        // Add 10 points for logging a workout
        if (user) {
          updateProfile({ points: (user.points || 0) + 10 });
        }
        return true;
      }
    } catch (err) {
      showToast('Error logging workout', 'error');
    }
    return false;
  };

  const deleteWorkout = async (id) => {
    try {
      const res = await fetch(`${API_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setWorkouts(prev => prev.filter(w => w._id !== id));
        showToast('Workout entry removed.');
      }
    } catch (err) {
      showToast('Error deleting workout', 'error');
    }
  };

  // Gym Check-ins (Toggles checkin for a date string YYYY-MM-DD)
  const toggleCheckIn = async (dateStr) => {
    try {
      const res = await fetch(`${API_URL}/checkins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      if (res.ok) {
        const checkinResult = await res.json();
        
        // Update checkins state locally
        if (checkinResult.checkedIn) {
          setCheckins(prev => [...prev, checkinResult]);
          showToast('Checked in! Welcome to the gym! 🏋️');
          
          // Reward points + add to streak
          const newPoints = (user.points || 0) + 20;
          const today = new Date().toISOString().split('T')[0];
          let newStreak = user.streakCount || 0;
          
          if (user.lastActiveDate !== today) {
            newStreak += 1;
          }
          
          updateProfile({ 
            points: newPoints, 
            streakCount: newStreak, 
            lastActiveDate: today 
          });
        } else {
          setCheckins(prev => prev.filter(c => c.date !== dateStr));
          showToast('Check-in cancelled.');
        }
        return true;
      }
    } catch (err) {
      showToast('Error toggling check-in', 'error');
    }
    return false;
  };

  // Nutrition
  const addNutrition = async (nutritionData) => {
    try {
      const res = await fetch(`${API_URL}/nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nutritionData)
      });
      if (res.ok) {
        const newLog = await res.json();
        setNutritionLogs(prev => [newLog, ...prev]);
        showToast('Meal logged successfully.');
        return true;
      }
    } catch (err) {
      showToast('Error logging meal', 'error');
    }
    return false;
  };

  const deleteNutrition = async (id) => {
    try {
      const res = await fetch(`${API_URL}/nutrition/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNutritionLogs(prev => prev.filter(n => n._id !== id));
        showToast('Meal record deleted.');
      }
    } catch (err) {
      showToast('Error removing meal', 'error');
    }
  };

  // Sleep
  const addSleep = async (sleepData) => {
    try {
      const res = await fetch(`${API_URL}/sleep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sleepData)
      });
      if (res.ok) {
        const newSleep = await res.json();
        
        // Check if updating or adding
        setSleepLogs(prev => {
          const filtered = prev.filter(s => s.date !== sleepData.date);
          return [newSleep, ...filtered];
        });
        showToast('Sleep logged successfully.');
        return true;
      }
    } catch (err) {
      showToast('Error logging sleep', 'error');
    }
    return false;
  };

  // Food Database CRUD
  const addFood = async (foodData) => {
    try {
      const res = await fetch(`${API_URL}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(foodData)
      });
      if (res.ok) {
        const newFood = await res.json();
        setFoods(prev => [...prev, newFood].sort((a, b) => a.name.localeCompare(b.name)));
        showToast('Food saved to search database!');
        return newFood;
      }
    } catch (err) {
      showToast('Error saving food', 'error');
    }
    return false;
  };

  const updateFood = async (id, foodData) => {
    try {
      const res = await fetch(`${API_URL}/foods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(foodData)
      });
      if (res.ok) {
        const updatedFood = await res.json();
        setFoods(prev => prev.map(f => f._id === id ? updatedFood : f).sort((a, b) => a.name.localeCompare(b.name)));
        showToast('Food updated successfully.');
        return true;
      }
    } catch (err) {
      showToast('Error updating food', 'error');
    }
    return false;
  };

  const deleteFood = async (id) => {
    try {
      const res = await fetch(`${API_URL}/foods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFoods(prev => prev.filter(f => f._id !== id));
        showToast('Food deleted from search database.');
        return true;
      }
    } catch (err) {
      showToast('Error deleting food', 'error');
    }
    return false;
  };

  // Challenges
  const joinChallenge = async (id) => {
    try {
      const res = await fetch(`${API_URL}/challenges/join/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedChallenge = await res.json();
        setChallenges(prev => prev.map(c => c._id === id ? updatedChallenge : c));
        showToast('Joined the challenge! Get active!');
      }
    } catch (err) {
      showToast('Error joining challenge', 'error');
    }
  };

  const completeChallenge = async (id) => {
    try {
      const res = await fetch(`${API_URL}/challenges/complete/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(prev => prev.map(c => c._id === id ? data.challenge : c));
        showToast(`Challenge Completed! Earned +${data.pointsAwarded} points! 🏆`);
        
        // Reload user profile (points & badges updated)
        if (user) {
          updateProfile({ points: (user.points || 0) + data.pointsAwarded });
        }
      }
    } catch (err) {
      showToast('Error completing challenge', 'error');
    }
  };

  // Wearable Device Synchronization Simulator
  const syncWearableData = (deviceType) => {
    setWearableState({
      synced: false,
      device: deviceType,
      steps: 0,
      heartRate: 0,
      caloriesBurned: 0,
      syncTime: null
    });

    // Simulate import sync delay
    setTimeout(() => {
      const randSteps = Math.floor(6000 + Math.random() * 8000);
      const randHR = Math.floor(65 + Math.random() * 50);
      const randCal = Math.floor(250 + Math.random() * 450);
      
      setWearableState({
        synced: true,
        device: deviceType,
        steps: randSteps,
        heartRate: randHR,
        caloriesBurned: randCal,
        syncTime: new Date().toLocaleTimeString()
      });

      showToast(`Automatically imported Health details from ${deviceType}!`);

      // Reward points for wearable syncing
      if (user) {
        updateProfile({ points: (user.points || 0) + 15 });
      }
    }, 1500);
  };

  return (
    <FitnessContext.Provider
      value={{
        goals,
        activeGoal: goals.find(g => !g.completed) || goals[0] || null,
        workouts,
        checkins,
        nutritionLogs,
        sleepLogs,
        challenges,
        invoices,
        foods,
        wearableState,
        adminUsers,
        adminStats,
        loading,
        fetchFitnessData,
        addGoal,
        deleteGoal,
        addWorkout,
        deleteWorkout,
        toggleCheckIn,
        addNutrition,
        deleteNutrition,
        addSleep,
        joinChallenge,
        completeChallenge,
        syncWearableData,
        toggleUserStatus,
        fetchAdminData,
        addFood,
        updateFood,
        deleteFood
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);
