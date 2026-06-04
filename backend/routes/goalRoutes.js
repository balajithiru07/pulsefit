import express from 'express';
import Goal from '../models/Goal.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all goals for logged in user
// @route   GET /api/goals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const userGoals = global.mockDB.goals.filter(
        g => g.user.toString() === req.user._id.toString()
      );
      res.json(userGoals);
    } else {
      const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(goals);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new fitness goal
// @route   POST /api/goals
// @access  Private
router.post('/', protect, async (req, res) => {
  const { goalType, startWeight, targetWeight, targetDate } = req.body;

  if (!goalType || !startWeight || !targetWeight || !targetDate) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    if (global.isMockDB) {
      const newGoal = {
        _id: new Date().getTime().toString(),
        user: req.user._id.toString(),
        goalType,
        startWeight: Number(startWeight),
        targetWeight: Number(targetWeight),
        startDate: new Date(),
        targetDate: new Date(targetDate),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.mockDB.goals.push(newGoal);
      res.status(201).json(newGoal);
    } else {
      const goal = await Goal.create({
        user: req.user._id,
        goalType,
        startWeight: Number(startWeight),
        targetWeight: Number(targetWeight),
        targetDate: new Date(targetDate)
      });
      res.status(201).json(goal);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update fitness goal
// @route   PUT /api/goals/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { goalType, targetWeight, targetDate, completed } = req.body;

  try {
    if (global.isMockDB) {
      const goalIndex = global.mockDB.goals.findIndex(
        g => g._id.toString() === req.params.id.toString() && g.user.toString() === req.user._id.toString()
      );

      if (goalIndex === -1) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const goal = global.mockDB.goals[goalIndex];
      goal.goalType = goalType !== undefined ? goalType : goal.goalType;
      goal.targetWeight = targetWeight !== undefined ? Number(targetWeight) : goal.targetWeight;
      goal.targetDate = targetDate !== undefined ? new Date(targetDate) : goal.targetDate;
      goal.completed = completed !== undefined ? completed : goal.completed;
      goal.updatedAt = new Date();

      global.mockDB.goals[goalIndex] = goal;
      res.json(goal);
    } else {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      goal.goalType = goalType !== undefined ? goalType : goal.goalType;
      goal.targetWeight = targetWeight !== undefined ? Number(targetWeight) : goal.targetWeight;
      goal.targetDate = targetDate !== undefined ? new Date(targetDate) : goal.targetDate;
      goal.completed = completed !== undefined ? completed : goal.completed;

      const updatedGoal = await goal.save();
      res.json(updatedGoal);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete fitness goal
// @route   DELETE /api/goals/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const goalIndex = global.mockDB.goals.findIndex(
        g => g._id.toString() === req.params.id.toString() && g.user.toString() === req.user._id.toString()
      );

      if (goalIndex === -1) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      global.mockDB.goals.splice(goalIndex, 1);
      res.json({ message: 'Goal removed successfully' });
    } else {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      await goal.deleteOne();
      res.json({ message: 'Goal removed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
