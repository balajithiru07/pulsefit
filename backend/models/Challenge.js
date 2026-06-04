import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metric: {
    type: String, // 'steps', 'workouts', 'water', 'sleep'
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
