import express from 'express';
import CheckIn from '../models/CheckIn.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all check-in dates for user
// @route   GET /api/checkins
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const userCheckins = global.mockDB.checkins.filter(
        c => c.user.toString() === req.user._id.toString() && c.checkedIn === true
      );
      res.json(userCheckins);
    } else {
      const checkins = await CheckIn.find({ user: req.user._id, checkedIn: true });
      res.json(checkins);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle gym check-in for a specific date (YYYY-MM-DD)
// @route   POST /api/checkins
// @access  Private
router.post('/', protect, async (req, res) => {
  const { date } = req.body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Please provide a valid date in YYYY-MM-DD format' });
  }

  try {
    if (global.isMockDB) {
      const index = global.mockDB.checkins.findIndex(
        c => c.user.toString() === req.user._id.toString() && c.date === date
      );

      if (index !== -1) {
        // Toggle: Flip checkin state or just remove if checked in
        const currentVal = global.mockDB.checkins[index].checkedIn;
        global.mockDB.checkins[index].checkedIn = !currentVal;
        global.mockDB.checkins[index].updatedAt = new Date();
        res.json(global.mockDB.checkins[index]);
      } else {
        // Create new check-in
        const newCheckin = {
          _id: new Date().getTime().toString(),
          user: req.user._id.toString(),
          date,
          checkedIn: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        global.mockDB.checkins.push(newCheckin);
        res.status(201).json(newCheckin);
      }
    } else {
      // Find existing checkin
      let checkin = await CheckIn.findOne({ user: req.user._id, date });

      if (checkin) {
        checkin.checkedIn = !checkin.checkedIn;
        await checkin.save();
        res.json(checkin);
      } else {
        checkin = await CheckIn.create({
          user: req.user._id,
          date,
          checkedIn: true
        });
        res.status(201).json(checkin);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
