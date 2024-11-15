// backend/src/app.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const importRoutes = async () => {
  const { authRouter } = await import('./routes/auth.js');
  const { commandsRouter } = await import('./routes/commands.js');
  const { authenticate } = await import('./middleware/auth.js');

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/commands', authenticate, commandsRouter);
};

// Error handling middleware should be after routes
app.use(errorHandler);

// Connect to MongoDB with proper options
try {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');
  await importRoutes();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}

export default app;