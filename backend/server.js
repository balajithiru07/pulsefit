import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import sleepRoutes from './routes/sleepRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import foodRoutes from './routes/foodRoutes.js';

// Load env variables
dotenv.config();

// Initialize Express app
const app = express();

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support base64 images

// Initialize Global Mock Store for fallback usage
global.mockDB = {
  users: [],
  goals: [],
  workouts: [],
  checkins: [],
  nutrition: [],
  sleep: [],
  challenges: [],
  invoices: [],
  foods: []
};
global.isMockDB = false;

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/foods', foodRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the PulseFit API',
    databaseMode: global.isMockDB ? 'In-Memory (Mock)' : 'MongoDB (Live)'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 PulseFit API Server running on port ${PORT}`);
  console.log(`📂 Mode: ${global.isMockDB ? 'In-Memory Mock Fallback' : 'MongoDB Live Connected'}`);
});
