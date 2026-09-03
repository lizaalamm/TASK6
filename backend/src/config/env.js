const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const required = ['JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  db: {
    dialect: process.env.DB_DIALECT || 'postgres',
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    storage: process.env.SQLITE_STORAGE || path.join(__dirname, '../../dev.sqlite'),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
