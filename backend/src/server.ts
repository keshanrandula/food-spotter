import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import placesRoutes from './routes/places';
import reviewsRoutes from './routes/reviews';
import savedRoutes from './routes/saved';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use('/api/places', placesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/saved', savedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SavorAI Backend API Server is running cleanly.' });
});

app.listen(PORT, () => {
  console.log(`🚀 SavorAI Express Backend Server running on http://localhost:${PORT}`);
});
