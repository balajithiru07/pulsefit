import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: null // in cm
  },
  weight: {
    type: Number,
    default: null // in kg
  },
  fitnessGoals: {
    type: [String],
    default: []
  },
  profilePic: {
    type: String,
    default: '' // Base64 or icon name
  },
  // Nutrition Goals config
  targetCalories: {
    type: Number,
    default: 2000
  },
  targetProtein: {
    type: Number,
    default: 150 // in grams
  },
  targetCarbs: {
    type: Number,
    default: 220 // in grams
  },
  targetFat: {
    type: Number,
    default: 65 // in grams
  },
  targetWater: {
    type: Number,
    default: 3000 // in ml
  },
  // Extended state
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  points: {
    type: Number,
    default: 0
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: String,
    default: ''
  },
  badges: {
    type: [String],
    default: []
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
