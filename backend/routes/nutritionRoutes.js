import express from 'express';
import Nutrition from '../models/Nutrition.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get nutrition logs for the user (by date or general history)
// @route   GET /api/nutrition
// @access  Private
router.get('/', protect, async (req, res) => {
  const { date } = req.query; // optional filter by YYYY-MM-DD
  try {
    if (global.isMockDB) {
      let logs = global.mockDB.nutrition.filter(
        n => n.user.toString() === req.user._id.toString()
      );
      if (date) {
        logs = logs.filter(n => n.date === date);
      }
      res.json(logs);
    } else {
      const query = { user: req.user._id };
      if (date) query.date = date;
      const logs = await Nutrition.find(query).sort({ createdAt: -1 });
      res.json(logs);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Log a new meal or update water intake
// @route   POST /api/nutrition
// @access  Private
router.post('/', protect, async (req, res) => {
  const { mealName, foods, waterIntake, date } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Please provide a log date (YYYY-MM-DD)' });
  }

  try {
    const formattedFoods = Array.isArray(foods)
      ? foods.map(f => ({
          name: f.name,
          calories: Number(f.calories || 0),
          protein: Number(f.protein || 0),
          carbs: Number(f.carbs || 0),
          fat: Number(f.fat || 0)
        }))
      : [];

    if (global.isMockDB) {
      // For water tracking, we might want to check if a log for this date and meal already exists,
      // or if we're just adding a log.
      const newLog = {
        _id: new Date().getTime().toString(),
        user: req.user._id.toString(),
        mealName: mealName || 'Water Log',
        foods: formattedFoods,
        waterIntake: Number(waterIntake || 0),
        date,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.mockDB.nutrition.push(newLog);
      res.status(201).json(newLog);
    } else {
      const log = await Nutrition.create({
        user: req.user._id,
        mealName: mealName || 'Water Log',
        foods: formattedFoods,
        waterIntake: Number(waterIntake || 0),
        date
      });
      res.status(201).json(log);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a nutrition log entry
// @route   DELETE /api/nutrition/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const index = global.mockDB.nutrition.findIndex(
        n => n._id.toString() === req.params.id.toString() && n.user.toString() === req.user._id.toString()
      );
      if (index === -1) {
        return res.status(404).json({ message: 'Nutrition entry not found' });
      }
      global.mockDB.nutrition.splice(index, 1);
      res.json({ message: 'Nutrition entry removed' });
    } else {
      const log = await Nutrition.findOne({ _id: req.params.id, user: req.user._id });
      if (!log) {
        return res.status(404).json({ message: 'Nutrition entry not found' });
      }
      await log.deleteOne();
      res.json({ message: 'Nutrition entry removed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
