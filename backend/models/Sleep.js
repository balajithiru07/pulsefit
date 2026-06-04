import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  quality: {
    type: Number, // 1 to 5 stars
    required: true,
    min: 1,
    max: 5
  },
  stages: {
    deep: { type: Number, default: 0 }, // percentage
    light: { type: Number, default: 0 }, // percentage
    rem: { type: Number, default: 0 } // percentage
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  }
}, {
  timestamps: true
});

const Sleep = mongoose.model('Sleep', sleepSchema);
export default Sleep;
