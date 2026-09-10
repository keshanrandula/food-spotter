import express from 'express';
import cors from 'cors';
import { backendConfig } from './config/env';
import { connectDB } from './config/db';
import placesRoutes from './routes/places';
import reviewsRoutes from './routes/reviews';
import savedRoutes from './routes/saved';
import authRoutes from './routes/auth';
import reservationsRoutes from './routes/reservations';

const app = express();
const PORT = backendConfig.port;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use('/api/places', placesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SavorAI Backend API Server is running cleanly.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SavorAI Express Backend Server running on http://localhost:${PORT}`);
});
