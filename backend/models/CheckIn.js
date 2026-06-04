import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  checkedIn: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Avoid duplicate checkins for same user on same day
checkInSchema.index({ user: 1, date: 1 }, { unique: true });

const CheckIn = mongoose.model('CheckIn', checkInSchema);
export default CheckIn;
