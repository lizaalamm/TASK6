require('./config/env');
const app = require('./app');
const { sequelize, initModels } = require('./models');
const { seedUsers } = require('./seeders/seedUsers');
const env = require('./config/env');

const PORT = env.port;

(async () => {
  try {
    await sequelize.authenticate();
    console.log(
      env.db.dialect === 'sqlite' ? 'SQLite connected' : 'PostgreSQL connected'
    );

    await initModels();
    await seedUsers();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();
