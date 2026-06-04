import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true // in grams
  },
  carbs: {
    type: Number,
    required: true // in grams
  },
  fat: {
    type: Number,
    required: true // in grams
  }
});

const nutritionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealName: {
    type: String, // 'Breakfast', 'Lunch', 'Dinner', 'Snacks'
    required: true
  },
  foods: [foodSchema],
  waterIntake: {
    type: Number, // in ml
    default: 0
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  }
}, {
  timestamps: true
});

const Nutrition = mongoose.model('Nutrition', nutritionSchema);
export default Nutrition;
