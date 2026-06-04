import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true // in kg
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseName: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: [setSchema],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
