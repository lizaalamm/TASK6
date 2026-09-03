const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [env.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowed.includes(origin) || env.isDev) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    success: true,
    message: 'U Devs Car Showroom API is running',
    dialect: env.db.dialect,
  });
});

app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
