/**
 * backend/src/server.js
 * ----------------------------------------------------------------------------
 * Production entry point (`npm run dev` / `npm start`).
 * Boot sequence: load env → connect DB → sync models → seed demo users
 * → start listening. Any failure aborts the process with a loud error so a
 * process manager (pm2 / docker) can restart it.
 * ----------------------------------------------------------------------------
 */
require('./config/env'); // validates required env vars FIRST (throws if missing)
const app = require('./app');
const { sequelize, initModels } = require('./models');
const { seedUsers } = require('./seeders/seedUsers');
const { seedShowroom } = require('./seeders/seedShowroom');
const env = require('./config/env');

const PORT = env.port;

(async () => {
  try {
    // 1. Prove the database is reachable before doing anything else.
    await sequelize.authenticate();
    console.log(
      env.db.dialect === 'sqlite' ? 'SQLite connected' : 'PostgreSQL connected'
    );

    // 2. Create / migrate tables (incl. Postgres ENUM safety).
    await initModels();

    // 3. Insert demo accounts for any role missing from the DB.
    await seedUsers();

    // 3b. Insert demo vehicles + a demo PENDING application (idempotent).
    await seedShowroom();

    // 4. Bind to 0.0.0.0 so Docker / LAN / preview proxies can reach us.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();
