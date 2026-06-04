import express from 'express';
import Food from '../models/Food.js';
import protect from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_FOODS = [
  { name: 'Grilled Chicken Breast (150g)', calories: 247, protein: 46, carbs: 0, fat: 5 },
  { name: 'Brown Rice Cooked (150g)', calories: 195, protein: 4, carbs: 41, fat: 1 },
  { name: 'White Rice Cooked (150g)', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4 },
  { name: 'Whey Protein Shake', calories: 140, protein: 26, carbs: 3, fat: 2 },
  { name: 'Greek Yogurt Fat Free (200g)', calories: 110, protein: 20, carbs: 7, fat: 0 },
  { name: 'Oatmeal Plain (1 cup)', calories: 150, protein: 6, carbs: 27, fat: 3 },
  { name: 'Whole Egg Boiled', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Avocado Medium', calories: 240, protein: 3, carbs: 12, fat: 22 },
  { name: 'Peanut Butter (1 tbsp)', calories: 95, protein: 4, carbs: 3, fat: 8 },
  // User requested extras
  { name: '1 cup of coffee with milk', calories: 65, protein: 3, carbs: 6, fat: 2.5 },
  { name: 'Cooked boneless chicken(100g)', calories: 170, protein: 30, carbs: 0, fat: 4 },
  { name: 'White rice with curd', calories: 320, protein: 9, carbs: 58, fat: 5.5 },
  { name: 'White rice with sambar', calories: 360, protein: 10, carbs: 68, fat: 4.5 },
  { name: '1 cup tea of milk', calories: 55, protein: 2.5, carbs: 5, fat: 2 },
  { name: 'Peanut 100g', calories: 567, protein: 25, carbs: 16, fat: 49 },
  { name: 'White dhal 100g (cooked)', calories: 116, protein: 7, carbs: 20, fat: 0.4 },
  { name: 'Black dhal 100g (cooked)', calories: 120, protein: 8, carbs: 21, fat: 0.5 }
];

// Helper to seed in-memory mockDB
const seedMockFoods = () => {
  if (global.mockDB.foods.length === 0) {
    DEFAULT_FOODS.forEach((f, idx) => {
      global.mockDB.foods.push({
        _id: `FOOD-MOCK-${idx}`,
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        creator: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }
};

// @desc    Get all foods (global defaults + user's custom foods)
// @route   GET /api/foods
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      seedMockFoods();
      const userFoods = global.mockDB.foods.filter(
        f => f.creator === null || f.creator === req.user._id.toString()
      );
      res.json(userFoods);
    } else {
      // Self-healing check: Seed default foods if collection is empty
      const count = await Food.countDocuments({ creator: null });
      if (count === 0) {
        await Food.insertMany(DEFAULT_FOODS.map(f => ({ ...f, creator: null })));
      }

      const foods = await Food.find({
        $or: [
          { creator: null },
          { creator: req.user._id }
        ]
      }).sort({ name: 1 });
      res.json(foods);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a custom food item
// @route   POST /api/foods
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body;

  if (!name || calories === undefined) {
    return res.status(400).json({ message: 'Name and calories are required' });
  }

  try {
    if (global.isMockDB) {
      const newFood = {
        _id: new Date().getTime().toString(),
        name,
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
        creator: req.user._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.mockDB.foods.push(newFood);
      res.status(201).json(newFood);
    } else {
      const food = await Food.create({
        name,
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
        creator: req.user._id
      });
      res.status(201).json(food);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a custom food item
// @route   PUT /api/foods/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body;

  try {
    if (global.isMockDB) {
      const index = global.mockDB.foods.findIndex(
        f => f._id.toString() === req.params.id.toString()
      );

      if (index === -1) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      const food = global.mockDB.foods[index];

      // Authorization Guard
      if (!food.creator || food.creator !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update default/other foods' });
      }

      food.name = name !== undefined ? name : food.name;
      food.calories = calories !== undefined ? Number(calories) : food.calories;
      food.protein = protein !== undefined ? Number(protein) : food.protein;
      food.carbs = carbs !== undefined ? Number(carbs) : food.carbs;
      food.fat = fat !== undefined ? Number(fat) : food.fat;
      food.updatedAt = new Date();

      global.mockDB.foods[index] = food;
      res.json(food);
    } else {
      const food = await Food.findById(req.params.id);

      if (!food) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      // Authorization Guard
      if (!food.creator || food.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update default/other foods' });
      }

      food.name = name !== undefined ? name : food.name;
      food.calories = calories !== undefined ? Number(calories) : food.calories;
      food.protein = protein !== undefined ? Number(protein) : food.protein;
      food.carbs = carbs !== undefined ? Number(carbs) : food.carbs;
      food.fat = fat !== undefined ? Number(fat) : food.fat;

      const updatedFood = await food.save();
      res.json(updatedFood);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a custom food item
// @route   DELETE /api/foods/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const index = global.mockDB.foods.findIndex(
        f => f._id.toString() === req.params.id.toString()
      );

      if (index === -1) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      const food = global.mockDB.foods[index];

      // Authorization Guard
      if (!food.creator || food.creator !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete default/other foods' });
      }

      global.mockDB.foods.splice(index, 1);
      res.json({ message: 'Food item removed successfully' });
    } else {
      const food = await Food.findById(req.params.id);

      if (!food) {
        return res.status(404).json({ message: 'Food item not found' });
      }

      // Authorization Guard
      if (!food.creator || food.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete default/other foods' });
      }

      await food.deleteOne();
      res.json({ message: 'Food item removed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
