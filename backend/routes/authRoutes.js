import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretpulsefitkey1234!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    if (global.isMockDB) {
      // Mock DB logic
      const exists = global.mockDB.users.find(u => u.email === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ message: 'User already exists in mock store' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: new Date().getTime().toString(), // String ID
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || '',
        age: null,
        gender: '',
        height: null,
        weight: null,
        fitnessGoals: [],
        profilePic: '',
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 220,
        targetFat: 65,
        targetWater: 3000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      global.mockDB.users.push(newUser);

      res.status(201).json({
        token: generateToken(newUser._id),
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profilePic: newUser.profilePic
        }
      });
    } else {
      // Live DB logic
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || ''
      });

      if (user) {
        res.status(201).json({
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic
          }
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (global.isMockDB) {
      const user = global.mockDB.users.find(u => u.email === email.toLowerCase());
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a simple numeric recovery code (token)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (global.isMockDB) {
      const userIndex = global.mockDB.users.findIndex(u => u.email === email.toLowerCase());
      if (userIndex === -1) {
        return res.status(404).json({ message: 'Email address not found' });
      }

      global.mockDB.users[userIndex].resetPasswordToken = resetToken;
      global.mockDB.users[userIndex].resetPasswordExpires = expiry;
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Email address not found' });
      }

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expiry;
      await user.save();
    }

    // In a real application, send an email. For this app, return it in response to make manual recovery and testing easy!
    console.log(`🔑 PASSWORD RESET CODE FOR ${email}: ${resetToken}`);
    res.json({
      message: 'Password reset code generated successfully.',
      code: resetToken // Return code in response for demo purposes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Please provide all details' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    if (global.isMockDB) {
      const userIndex = global.mockDB.users.findIndex(
        u => u.email === email.toLowerCase() &&
             u.resetPasswordToken === code &&
             new Date(u.resetPasswordExpires) > new Date()
      );

      if (userIndex === -1) {
        return res.status(400).json({ message: 'Invalid or expired password reset code' });
      }

      global.mockDB.users[userIndex].password = hashedNewPassword;
      delete global.mockDB.users[userIndex].resetPasswordToken;
      delete global.mockDB.users[userIndex].resetPasswordExpires;

      res.json({ message: 'Password reset successful!' });
    } else {
      const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordToken: code,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset code' });
      }

      user.password = hashedNewPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const user = global.mockDB.users.find(u => u._id.toString() === req.user._id.toString());
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { 
    name, age, gender, height, weight, fitnessGoals, profilePic,
    targetCalories, targetProtein, targetCarbs, targetFat, targetWater 
  } = req.body;

  try {
    if (global.isMockDB) {
      const userIndex = global.mockDB.users.findIndex(u => u._id.toString() === req.user._id.toString());
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found in mock store' });
      }

      // Update in-memory user
      const user = global.mockDB.users[userIndex];
      user.name = name !== undefined ? name : user.name;
      user.age = age !== undefined ? Number(age) : user.age;
      user.gender = gender !== undefined ? gender : user.gender;
      user.height = height !== undefined ? Number(height) : user.height;
      user.weight = weight !== undefined ? Number(weight) : user.weight;
      user.fitnessGoals = fitnessGoals !== undefined ? fitnessGoals : user.fitnessGoals;
      user.profilePic = profilePic !== undefined ? profilePic : user.profilePic;
      
      // Nutrition goals updates
      user.targetCalories = targetCalories !== undefined ? Number(targetCalories) : user.targetCalories;
      user.targetProtein = targetProtein !== undefined ? Number(targetProtein) : user.targetProtein;
      user.targetCarbs = targetCarbs !== undefined ? Number(targetCarbs) : user.targetCarbs;
      user.targetFat = targetFat !== undefined ? Number(targetFat) : user.targetFat;
      user.targetWater = targetWater !== undefined ? Number(targetWater) : user.targetWater;
      
      user.updatedAt = new Date();

      global.mockDB.users[userIndex] = user;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name !== undefined ? name : user.name;
      user.age = age !== undefined ? Number(age) : user.age;
      user.gender = gender !== undefined ? gender : user.gender;
      user.height = height !== undefined ? Number(height) : user.height;
      user.weight = weight !== undefined ? Number(weight) : user.weight;
      user.fitnessGoals = fitnessGoals !== undefined ? fitnessGoals : user.fitnessGoals;
      user.profilePic = profilePic !== undefined ? profilePic : user.profilePic;

      // Nutrition goals updates
      user.targetCalories = targetCalories !== undefined ? Number(targetCalories) : user.targetCalories;
      user.targetProtein = targetProtein !== undefined ? Number(targetProtein) : user.targetProtein;
      user.targetCarbs = targetCarbs !== undefined ? Number(targetCarbs) : user.targetCarbs;
      user.targetFat = targetFat !== undefined ? Number(targetFat) : user.targetFat;
      user.targetWater = targetWater !== undefined ? Number(targetWater) : user.targetWater;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        fitnessGoals: updatedUser.fitnessGoals,
        profilePic: updatedUser.profilePic,
        targetCalories: updatedUser.targetCalories,
        targetProtein: updatedUser.targetProtein,
        targetCarbs: updatedUser.targetCarbs,
        targetFat: updatedUser.targetFat,
        targetWater: updatedUser.targetWater,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
