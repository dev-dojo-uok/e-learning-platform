import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import courseRoutes from './modules/courses/index.js';
import moduleRoutes from './modules/courseModules/index.js';
import quizRoutes from './modules/quizzes/quizzes.routes.js';
import forumRoutes from './modules/forums/forums.routes.js';
import completionRoutes from './modules/completion/completion.routes.js';
import assignmentRoutes from './modules/assignments/assignments.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'E-Learning Platform API is healthy' });
});

// Bind route dispatchers
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/completion', completionRoutes);
app.use('/api/assignments', assignmentRoutes);

// Error Handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler] Stack:', err.stack || err);
  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 ? 'Internal Server Error' : (err.message || 'Bad Request');
  res.status(statusCode).json({
    error: message,
    ...(err.errors && statusCode < 500 && { errors: err.errors })
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} \n\nhttp://localhost:${PORT}`);
});
