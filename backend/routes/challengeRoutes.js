import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to seed challenges if mock list is empty
const seedMockChallenges = () => {
  if (global.mockDB.challenges.length === 0) {
    global.mockDB.challenges = [
      {
        _id: 'c1',
        title: 'Hydration Station Marathon',
        description: 'Drink at least 3000ml of water in a single day.',
        metric: 'water',
        targetValue: 3000,
        points: 50,
        participants: [],
        completedUsers: []
      },
      {
        _id: 'c2',
        title: 'Weekly Workout Warrior',
        description: 'Complete 3 full workout log entries.',
        metric: 'workouts',
        targetValue: 3,
        points: 100,
        participants: [],
        completedUsers: []
      },
      {
        _id: 'c3',
        title: 'Steps Optimizer Challenge',
        description: 'Log a smartwatch activity showing 10,000 steps.',
        metric: 'steps',
        targetValue: 10000,
        points: 75,
        participants: [],
        completedUsers: []
      },
      {
        _id: 'c4',
        title: 'Deep Rest Recovery Challenge',
        description: 'Log a sleep session showing at least 8 hours of sleep.',
        metric: 'sleep',
        targetValue: 8,
        points: 60,
        participants: [],
        completedUsers: []
      }
    ];
  }
};

// @desc    Get all active challenges
// @route   GET /api/challenges
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      seedMockChallenges();
      res.json(global.mockDB.challenges);
    } else {
      // Find all challenges, seed default ones if none exist in collection
      let challenges = await Challenge.find();
      if (challenges.length === 0) {
        challenges = await Challenge.insertMany([
          {
            title: 'Hydration Station Marathon',
            description: 'Drink at least 3000ml of water in a single day.',
            metric: 'water',
            targetValue: 3000,
            points: 50,
            participants: [],
            completedUsers: []
          },
          {
            title: 'Weekly Workout Warrior',
            description: 'Complete 3 full workout log entries.',
            metric: 'workouts',
            targetValue: 3,
            points: 100,
            participants: [],
            completedUsers: []
          },
          {
            title: 'Steps Optimizer Challenge',
            description: 'Log a smartwatch activity showing 10,000 steps.',
            metric: 'steps',
            targetValue: 10000,
            points: 75,
            participants: [],
            completedUsers: []
          },
          {
            title: 'Deep Rest Recovery Challenge',
            description: 'Log a sleep session showing at least 8 hours of sleep.',
            metric: 'sleep',
            targetValue: 8,
            points: 60,
            participants: [],
            completedUsers: []
          }
        ]);
      }
      res.json(challenges);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Join an active challenge
// @route   POST /api/challenges/join/:id
// @access  Private
router.post('/join/:id', protect, async (req, res) => {
  const userId = req.user._id.toString();
  try {
    if (global.isMockDB) {
      seedMockChallenges();
      const index = global.mockDB.challenges.findIndex(c => c._id.toString() === req.params.id.toString());
      if (index === -1) {
        return res.status(404).json({ message: 'Challenge not found' });
      }

      const challenge = global.mockDB.challenges[index];
      if (challenge.participants.includes(userId)) {
        return res.status(400).json({ message: 'Already participating in this challenge' });
      }

      challenge.participants.push(userId);
      global.mockDB.challenges[index] = challenge;
      res.json(challenge);
    } else {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }

      if (challenge.participants.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already participating in this challenge' });
      }

      challenge.participants.push(req.user._id);
      await challenge.save();
      res.json(challenge);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Complete a joined challenge (adds points & badges)
// @route   POST /api/challenges/complete/:id
// @access  Private
router.post('/complete/:id', protect, async (req, res) => {
  const userId = req.user._id.toString();
  try {
    if (global.isMockDB) {
      seedMockChallenges();
      const index = global.mockDB.challenges.findIndex(c => c._id.toString() === req.params.id.toString());
      if (index === -1) {
        return res.status(404).json({ message: 'Challenge not found' });
      }

      const challenge = global.mockDB.challenges[index];
      if (!challenge.participants.includes(userId)) {
        return res.status(400).json({ message: 'You must join this challenge first' });
      }

      if (challenge.completedUsers.includes(userId)) {
        return res.status(400).json({ message: 'Challenge already completed' });
      }

      challenge.completedUsers.push(userId);
      global.mockDB.challenges[index] = challenge;

      // Reward points and badges to mock user
      const userIndex = global.mockDB.users.findIndex(u => u._id.toString() === userId);
      if (userIndex !== -1) {
        global.mockDB.users[userIndex].points += challenge.points;

        const badgeName = `${challenge.title} Winner 🏆`;
        if (!global.mockDB.users[userIndex].badges.includes(badgeName)) {
          global.mockDB.users[userIndex].badges.push(badgeName);
        }
      }

      res.json({ challenge, pointsAwarded: challenge.points });
    } else {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }

      if (!challenge.participants.includes(req.user._id)) {
        return res.status(400).json({ message: 'You must join this challenge first' });
      }

      if (challenge.completedUsers.includes(req.user._id)) {
        return res.status(400).json({ message: 'Challenge already completed' });
      }

      challenge.completedUsers.push(req.user._id);
      await challenge.save();

      // Reward points and badges to DB user
      const user = await User.findById(req.user._id);
      if (user) {
        user.points += challenge.points;
        const badgeName = `${challenge.title} Winner 🏆`;
        if (!user.badges.includes(badgeName)) {
          user.badges.push(badgeName);
        }
        await user.save();
      }

      res.json({ challenge, pointsAwarded: challenge.points });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
