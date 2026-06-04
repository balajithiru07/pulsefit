import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates it is a global default food
  }
}, {
  timestamps: true
});

const Food = mongoose.model('Food', foodSchema);
export default Food;
