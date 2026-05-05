const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { CLIENT_URL } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const usersRoutes = require('./modules/users/users.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
});

app.use(globalLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'TaskFlow API is running', data: null });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/projects', tasksRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', usersRoutes);

app.use(errorHandler);

module.exports = app;
