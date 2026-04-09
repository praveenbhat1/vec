import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import resourceRoutes from './routes/resources.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => res.send('CrisisChain API is running.'));

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crisischain';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Start server regardless of DB status for better debugging
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
});
