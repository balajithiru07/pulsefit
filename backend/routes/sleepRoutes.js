import express from 'express';
import Sleep from '../models/Sleep.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get sleep logs for user
// @route   GET /api/sleep
// @access  Private
router.get('/', protect, async (req, res) => {
  const { date } = req.query;
  try {
    if (global.isMockDB) {
      let logs = global.mockDB.sleep.filter(
        s => s.user.toString() === req.user._id.toString()
      );
      if (date) {
        logs = logs.filter(s => s.date === date);
      }
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json(logs);
    } else {
      const query = { user: req.user._id };
      if (date) query.date = date;
      const logs = await Sleep.find(query).sort({ date: -1 });
      res.json(logs);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Log sleep entry
// @route   POST /api/sleep
// @access  Private
router.post('/', protect, async (req, res) => {
  const { duration, quality, stages, date } = req.body;

  if (!duration || !quality || !date) {
    return res.status(400).json({ message: 'Please provide duration, quality, and log date' });
  }

  try {
    const sleepStages = stages || { deep: 20, light: 60, rem: 20 };

    if (global.isMockDB) {
      // Find if sleep already logged for this date and update, or add new
      const index = global.mockDB.sleep.findIndex(
        s => s.user.toString() === req.user._id.toString() && s.date === date
      );

      const logData = {
        user: req.user._id.toString(),
        duration: Number(duration),
        quality: Number(quality),
        stages: {
          deep: Number(sleepStages.deep || 0),
          light: Number(sleepStages.light || 0),
          rem: Number(sleepStages.rem || 0)
        },
        date,
        updatedAt: new Date()
      };

      if (index !== -1) {
        global.mockDB.sleep[index] = {
          ...global.mockDB.sleep[index],
          ...logData
        };
        res.json(global.mockDB.sleep[index]);
      } else {
        const newSleepLog = {
          _id: new Date().getTime().toString(),
          ...logData,
          createdAt: new Date()
        };
        global.mockDB.sleep.push(newSleepLog);
        res.status(201).json(newSleepLog);
      }
    } else {
      let sleepLog = await Sleep.findOne({ user: req.user._id, date });

      if (sleepLog) {
        sleepLog.duration = Number(duration);
        sleepLog.quality = Number(quality);
        sleepLog.stages = {
          deep: Number(sleepStages.deep || 0),
          light: Number(sleepStages.light || 0),
          rem: Number(sleepStages.rem || 0)
        };
        await sleepLog.save();
        res.json(sleepLog);
      } else {
        sleepLog = await Sleep.create({
          user: req.user._id,
          duration: Number(duration),
          quality: Number(quality),
          stages: {
            deep: Number(sleepStages.deep || 0),
            light: Number(sleepStages.light || 0),
            rem: Number(sleepStages.rem || 0)
          },
          date
        });
        res.status(201).json(sleepLog);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
