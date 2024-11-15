// backend/src/app.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import { authRouter } from './routes/auth.js';
import { commandsRouter } from './routes/commands.js';
import { folderRouter } from './routes/folders.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/commands', authenticate, commandsRouter);
app.use('/api/folders', authenticate, folderRouter);

// Error handling
app.use(errorHandler);

// Database connection with debugging
const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // Be careful with logging in production
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;