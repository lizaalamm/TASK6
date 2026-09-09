/**
 * backend/src/models/index.js
 * ----------------------------------------------------------------------------
 * Model registry: wires up relations between models and creates/updates the
 * database tables on server boot via `initModels()`.
 *
 * Relations:
 *   User (team lead) 1───* User (team member)  through `teamLeadId`
 *   User (manager)   1───* User (customer)     through `managerId`
 *   User (customer)  1───* Application         through `customerId`
 *   User (manager)   1───* Application         through `managerId`
 *   Vehicle          1───* Application         through `vehicleId`
 *   Application      1───* Payment             through `applicationId`
 *   User (customer)  1───* Payment             through `customerId`
 * ----------------------------------------------------------------------------
 */
const sequelize = require('../config/db');
const User = require('./userModel');
const Vehicle = require('./vehicleModel');
const Application = require('./applicationModel');
const Payment = require('./paymentModel');
const AuditLog = require('./auditLogModel');
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

// Each customer is optionally assigned one case manager (Super Admin assigns).
User.belongsTo(User, {
  as: 'manager',
  foreignKey: 'managerId',
  constraints: false,
});

// ...and each manager owns many customers.
User.hasMany(User, {
  as: 'managedCustomers',
  foreignKey: 'managerId',
  constraints: false,
});

// Applications belong to a customer (+ optional manager / vehicle).
Application.belongsTo(User, { as: 'customer', foreignKey: 'customerId', constraints: false });
Application.belongsTo(User, { as: 'manager', foreignKey: 'managerId', constraints: false });
Application.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicleId', constraints: false });
User.hasMany(Application, { as: 'applications', foreignKey: 'customerId', constraints: false });
User.hasMany(Application, {
  as: 'managedApplications',
  foreignKey: 'managerId',
  constraints: false,
});
Vehicle.hasMany(Application, { as: 'applications', foreignKey: 'vehicleId', constraints: false });

// Payments belong to an application + customer.
Payment.belongsTo(Application, {
  as: 'application',
  foreignKey: 'applicationId',
  constraints: false,
});
Payment.belongsTo(User, { as: 'customer', foreignKey: 'customerId', constraints: false });
Payment.belongsTo(User, { as: 'manager', foreignKey: 'managerId', constraints: false });
Application.hasMany(Payment, { as: 'payments', foreignKey: 'applicationId', constraints: false });
User.hasMany(Payment, { as: 'payments', foreignKey: 'customerId', constraints: false });

/**
 * Make sure the PostgreSQL ENUM type for `userType` contains every role.
 * Postgres ENUMs are rigid — adding a value (e.g. `manager`) to the model
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
  Vehicle,
  Application,
  Payment,
  AuditLog,
  initModels,
};
