/**
 * backend/src/config/db.js
 * ----------------------------------------------------------------------------
 * Shared Sequelize instance. Dialect is env-driven:
 *  - `postgres` (default) → production-grade database
 *  - `sqlite`             → zero-setup local/demo file database
 * SQL logging is ON in development, OFF otherwise.
 * ----------------------------------------------------------------------------
 */
const { Sequelize } = require('sequelize');
const env = require('./env');

// Verbose SQL in dev only — keeps production logs clean.
const logging = env.isDev ? console.log : false;

const sequelize =
  env.db.dialect === 'sqlite'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: env.db.storage,
        logging,
      })
    : new Sequelize(env.db.name, env.db.user, env.db.password, {
        host: env.db.host,
        port: env.db.port,
        dialect: 'postgres',
        logging,
      });

// Eager connection probe so misconfiguration shows up immediately on import.
sequelize
  .authenticate()
  .then(() =>
    console.log(
      env.db.dialect === 'sqlite' ? 'SQLite connected' : 'PostgreSQL connected'
    )
  )
  .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
