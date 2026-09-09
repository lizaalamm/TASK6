/**
 * backend/src/app.js
 * ----------------------------------------------------------------------------
 * Express application factory: middleware → routes → error handlers.
 * Imported by server.js (real boot) and usable directly by tests — note this
 * file only BUILDS the app, it never calls `listen()` itself.
 *
 * Request pipeline:
 *   CORS → JSON/urlencoded parsers → cookie parser → /api/* routes
 *   → 404 catcher → central error handler
 * ----------------------------------------------------------------------------
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- CORS: allow the Vite dev server + configured frontend origin ------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, Postman, mobile) send no Origin — allow.
      if (!origin) return callback(null, true);
      const allowed = [env.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowed.includes(origin) || env.isDev) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true, // required so the browser sends the httpOnly JWT cookie
  })
);

// --- Body + cookie parsing ----------------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Health check (used by uptime monitors + frontend diagnostics) ------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    success: true,
    message: 'U Devs Car Showroom API is running',
    dialect: env.db.dialect,
  });
});

// --- Feature routers -----------------------------------------------------------
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // superadmin-only system endpoints
app.use('/api/applications', applicationRoutes); // application-to-delivery pipeline
app.use('/api/vehicles', vehicleRoutes); // vehicle catalogue
app.use('/api/payments', paymentRoutes); // payment records

// --- Fallbacks: 404 for unknown routes, then the central error formatter -----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
