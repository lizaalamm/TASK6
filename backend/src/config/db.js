const { Sequelize } = require('sequelize');
const env = require('./env');

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

sequelize
  .authenticate()
  .then(() =>
    console.log(
      env.db.dialect === 'sqlite' ? 'SQLite connected' : 'PostgreSQL connected'
    )
  )
  .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
