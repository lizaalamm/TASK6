/**
 * backend/src/models/index.js
 * ----------------------------------------------------------------------------
 * Model registry: wires up relations between models and creates/updates the
 * database tables on server boot via `initModels()`.
 *
 * Relations:
 *   User (team lead) 1───* User (team member)  through `teamLeadId`
 * ----------------------------------------------------------------------------
 */
const sequelize = require('../config/db');
const User = require('./userModel');
const { ALLOWED_TYPES } = require('../constants/roles');

// Each user optionally belongs to one team lead (self-referencing FK).
User.belongsTo(User, {
  as: 'teamLead',
  foreignKey: 'teamLeadId',
  constraints: false, // keep SQLite + Postgres both happy
});

// ...and each team lead can have many team members.
User.hasMany(User, {
  as: 'teamMembers',
  foreignKey: 'teamLeadId',
  constraints: false,
});

/**
 * Make sure the PostgreSQL ENUM type for `userType` contains every role.
 * Postgres ENUMs are rigid — adding a value (e.g. `superadmin`) to the model
 * WITHOUT altering the type first makes `sync({ alter: true })` crash on an
 * existing database. This helper adds any missing values safely.
 */
const ensurePostgresRoleEnum = async () => {
  const queryInterface = sequelize.getQueryInterface();
  for (const role of ALLOWED_TYPES) {
    // `IF NOT EXISTS` keeps this idempotent — safe to run on every boot.
    // Table may not exist yet on first boot, so failures are swallowed and
    // `sync()` below will create the ENUM with all values from scratch.
    try {
      await sequelize.query(
        `ALTER TYPE "enum_Users_userType" ADD VALUE IF NOT EXISTS '${role}'`
      );
    } catch (error) {
      if (!/does not exist/i.test(error.message)) {
        throw error;
      }
    }
  }
  // Silence unused-var lint for queryInterface in setups without it.
  void queryInterface;
};

/**
 * Create new tables / apply model changes.
 *  - SQLite  : plain `sync()` (dev/demo friendly, keeps data).
 *  - Postgres: ensure ENUM values exist, then `sync({ alter: true })`.
 */
const initModels = async () => {
  const dialect = sequelize.getDialect();
  if (dialect === 'sqlite') {
    await sequelize.sync();
  } else {
    await ensurePostgresRoleEnum();
    await sequelize.sync({ alter: true });
  }
};

module.exports = {
  sequelize,
  User,
  initModels,
};
