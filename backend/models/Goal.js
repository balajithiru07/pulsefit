import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_building', 'endurance', 'general_fitness'],
    required: true
  },
  startWeight: {
    type: Number,
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
