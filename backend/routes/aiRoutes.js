import express from 'express';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate target calories & macros
const getGoalMetrics = (weight, height, age, gender, goal) => {
  let bmr = 0;
  // BMR Harris-Benedict formula
  const w = weight || 70;
  const h = height || 170;
  const a = age || 25;
  const g = gender || 'male';

  if (g.toLowerCase() === 'female') {
    bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
  } else {
    bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
  }

  // TDEE active modifier
  let tdee = Math.round(bmr * 1.4); // Moderately active default

  let targetCalories = tdee;
  let split = { protein: 30, carbs: 40, fat: 30 }; // default percentages
  let rateOfProgress = '';
  let timelineWeeks = 0;

  if (goal === 'weight_loss') {
    targetCalories = tdee - 500;
    split = { protein: 40, carbs: 35, fat: 25 }; // high protein, lower carb
    rateOfProgress = 'Target weight loss rate: 0.5 kg per week';
  } else if (goal === 'weight_gain') {
    targetCalories = tdee + 400;
    split = { protein: 30, carbs: 50, fat: 20 }; // high carb, high protein
    rateOfProgress = 'Target weight gain rate: 0.25 - 0.5 kg per week';
  } else if (goal === 'muscle_building') {
    targetCalories = tdee + 250;
    split = { protein: 35, carbs: 45, fat: 20 };
    rateOfProgress = 'Target muscle growth rate: 0.2 kg per week';
  } else if (goal === 'endurance') {
    targetCalories = tdee + 150;
    split = { protein: 25, carbs: 55, fat: 20 }; // very high carbs
    rateOfProgress = 'Target aerobic efficiency improvement';
  }

  const pGrams = Math.round((targetCalories * (split.protein / 100)) / 4);
  const cGrams = Math.round((targetCalories * (split.carbs / 100)) / 4);
  const fGrams = Math.round((targetCalories * (split.fat / 100)) / 9);

  return {
    tdee,
    targetCalories,
    macros: { protein: pGrams, carbs: cGrams, fat: fGrams },
    percentages: split,
    rateOfProgress
  };
};

// @desc    Interact with AI Fitness Coach Chatbot
// @route   POST /api/ai/coach
// @access  Private
router.post('/coach', protect, async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message query' });
  }

  try {
    const user = req.user;
    const email = user.email || 'Athlete';
    const name = user.name || email.split('@')[0];
    const weight = user.weight;
    const height = user.height;
    const age = user.age;
    const gender = user.gender;
    const mainGoal = (user.fitnessGoals && user.fitnessGoals[0]) || 'general_fitness';

    const metrics = getGoalMetrics(weight, height, age, gender, mainGoal);

    const lowercaseMsg = message.toLowerCase();
    let reply = '';

    // Smart contextual rules
    if (lowercaseMsg.includes('workout') || lowercaseMsg.includes('exercise') || lowercaseMsg.includes('plan')) {
      reply = `Hello ${name}! Based on your goal (**${mainGoal.replace('_', ' ')}**), here is a personalized 3-day workout split designed to maximize your efficiency:

💪 **Day 1: Upper Body Power**
- **Incline Bench Press**: 4 sets x 8 reps
- **Bent-Over Row**: 4 sets x 8 reps
- **Dumbbell Shoulder Press**: 3 sets x 10 reps
- **Lat Pulldowns**: 3 sets x 10 reps
- **Bicep Curl / Tricep Extension Superset**: 3 sets x 12 reps each

🦵 **Day 2: Lower Body & Core**
- **Barbell Back Squat**: 4 sets x 8 reps
- **Romanian Deadlift**: 4 sets x 10 reps
- **Leg Press**: 3 sets x 12 reps
- **Calf Raises**: 4 sets x 15 reps
- **Planks**: 3 sets x 60 seconds

🏃 **Day 3: Conditioning & Aerobic Fitness**
- **HIIT Sprint Training**: 15 minutes (30s sprint, 30s walk)
- **Hanging Leg Raises**: 3 sets x 15 reps
- **Kettlebell Swings**: 3 sets x 20 reps
- **Steady State Cardio**: 20 minutes (rower or incline treadmill)

*Coach Tip: Track your repetitions and try to increase the weights lifted by 1-2kg every week (Progressive Overload)!*`;
    } else if (lowercaseMsg.includes('diet') || lowercaseMsg.includes('food') || lowercaseMsg.includes('eat') || lowercaseMsg.includes('calorie') || lowercaseMsg.includes('macro')) {
      reply = `Here is your customized nutrition profile and macro targets, calculated specifically for you:

🥗 **PulseFit Calorie Target: ${metrics.targetCalories} kcal / day**
Your estimated daily TDEE (Total Daily Energy Expenditure) is **${metrics.tdee} kcal**. 

**Macro Split:**
- 🍗 **Protein**: ${metrics.macros.protein}g (${metrics.percentages.protein}%) — Essential for muscle repair.
- 🌾 **Carbs**: ${metrics.macros.carbs}g (${metrics.percentages.carbs}%) — Fuels your high-intensity workouts.
- 🥑 **Fats**: ${metrics.macros.fat}g (${metrics.percentages.fat}%) — Crucial for hormone regulation.

**Healthy Meal Layout Example:**
- **Breakfast**: Oatmeal with 1 scoop of whey protein, sliced banana, and a handful of almonds.
- **Lunch**: Grilled chicken breast (150g), brown rice (150g), and steamed broccoli.
- **Snack**: Greek yogurt (0% fat) with berries and honey.
- **Dinner**: Baked salmon (150g), sweet potato mash, and green beans in olive oil.

Make sure to log your meals and water intake directly in the **Nutrition Tab**!`;
    } else if (lowercaseMsg.includes('timeline') || lowercaseMsg.includes('predict') || lowercaseMsg.includes('how long') || lowercaseMsg.includes('when')) {
      if (!weight) {
        reply = `To predict your timeline, please update your current weight, height, and age in your Profile first so I can run my calculation! Currently they are missing.`;
      } else {
        reply = `Let's look at your timeline, ${name}. 
Currently, you weigh **${weight} kg**. 
Depending on your exact target weight (which you can set in the **Goals Tab**), a safe and sustainable rate of progression is about **0.5 kg per week**.

📅 **Goal Achievement Timeline Prediction:**
- **For a 5 kg change**: Approximately **10 weeks** of consistent training and nutrition.
- **For a 10 kg change**: Approximately **20 weeks** (5 months) of focused habit tracking.

*Tip: Consistent daily check-ins and logging workouts are the fastest way to accelerate this timeline!*`;
      }
    } else if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi') || lowercaseMsg.includes('hey')) {
      reply = `Hello ${name}! 👋 I am your PulseFit AI Fitness Coach. I am here to help you achieve your goals. 

Ask me anything, for example:
1. *"Show me a custom workout plan"*
2. *"What are my daily calorie and macro targets?"*
3. *"How long will it take to reach my goal?"*`;
    } else {
      reply = `That is an excellent question! When focusing on your **${mainGoal.replace('_', ' ')}** goals, the key parameters are consistency, sleep, and recovery. 

As your PulseFit Coach, I recommend:
1. **Sleep**: Ensure you get 7-8 hours of sleep per night to maximize growth hormone release (use the **Sleep Tab** to log your cycles).
2. **Hydration**: Drink at least 2.5 - 3 liters of water per day.
3. **Tracking**: Log every single set. If you lift 10kg today, aim for 11kg next week.

What other details about your training, diets, or progress analysis can I help you optimize today?`;
    }

    // Simulate AI response delay slightly (handled in frontend or immediate return)
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
