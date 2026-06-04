import express from 'express';
import Workout from '../models/Workout.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all workouts for logged in user
// @route   GET /api/workouts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const userWorkouts = global.mockDB.workouts.filter(
        w => w.user.toString() === req.user._id.toString()
      );
      // Sort by date descending
      userWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json(userWorkouts);
    } else {
      const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });
      res.json(workouts);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new workout log entry
// @route   POST /api/workouts
// @access  Private
router.post('/', protect, async (req, res) => {
  const { exerciseName, sets, duration, date } = req.body;

  if (!exerciseName || !sets || !Array.isArray(sets) || sets.length === 0 || !duration) {
    return res.status(400).json({ message: 'Please provide exercise name, sets, and duration' });
  }

  try {
    const formattedSets = sets.map(s => ({
      reps: Number(s.reps),
      weight: Number(s.weight)
    }));

    if (global.isMockDB) {
      const newWorkout = {
        _id: new Date().getTime().toString(),
        user: req.user._id.toString(),
        exerciseName,
        sets: formattedSets,
        duration: Number(duration),
        date: date ? new Date(date) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.mockDB.workouts.push(newWorkout);
      res.status(201).json(newWorkout);
    } else {
      const workout = await Workout.create({
        user: req.user._id,
        exerciseName,
        sets: formattedSets,
        duration: Number(duration),
        date: date ? new Date(date) : new Date()
      });
      res.status(201).json(workout);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete workout log entry
// @route   DELETE /api/workouts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const workoutIndex = global.mockDB.workouts.findIndex(
        w => w._id.toString() === req.params.id.toString() && w.user.toString() === req.user._id.toString()
      );

      if (workoutIndex === -1) {
        return res.status(404).json({ message: 'Workout log not found' });
      }

      global.mockDB.workouts.splice(workoutIndex, 1);
      res.json({ message: 'Workout log removed successfully' });
    } else {
      const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });

      if (!workout) {
        return res.status(404).json({ message: 'Workout log not found' });
      }

      await workout.deleteOne();
      res.json({ message: 'Workout log removed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
