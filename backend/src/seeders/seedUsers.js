/**
 * backend/src/seeders/seedUsers.js
 * ----------------------------------------------------------------------------
 * Demo accounts inserted automatically on server boot (and runnable manually).
 *
 *  - Runs on EVERY boot but skips emails that already exist (idempotent).
 *  - Passwords below are plain text ONLY here — the User model hashes them
 *    via its `beforeCreate` hook before they ever reach the database.
 *  - Manual run:  `node src/seeders/seedUsers.js`  (from `backend/`)
 *
 * Demo logins:
 *  | Role       | Email               | Password      |
 *  |------------|---------------------|---------------|
 *  | Superadmin | superadmin@udevs.com| Super@123     |
 *  | Admin      | admin@udevs.com     | Admin@123     |
 *  | Manager    | manager@udevs.com   | Manager@123   |
 *  | Sales      | sales@udevs.com     | Sales@123     |
 *  | Inventory  | inventory@udevs.com | Inventory@123 |
 *  | Customer   | customer@udevs.com  | Customer@123  |
 *  | Team lead  | lead@udevs.com      | Lead@1234     |
 * ----------------------------------------------------------------------------
 */
const { User } = require('../models');

// The demo roster — one account per role so every dashboard is testable.
const demoUsers = [
  {
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@udevs.com',
    password: 'Super@123',
    userType: 'superadmin', // platform owner — manages admins too
    phone: '03210000000',
    cnic: '11111-1111111-1',
    status: 'active',
  },
  {
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@udevs.com',
    password: 'Admin@123',
    userType: 'admin',
    phone: '03211234567',
    cnic: '12345-6789012-3',
    status: 'active',
  },
  {
    name: 'Case Manager',
    firstName: 'Case',
    lastName: 'Manager',
    email: 'manager@udevs.com',
    password: 'Manager@123',
    userType: 'manager', // assigned-only case owner (spec §2)
    phone: '03210000001',
    cnic: '11111-1111111-2',
    status: 'active',
  },
  {
    name: 'Sales Manager',
    firstName: 'Sales',
    lastName: 'Manager',
    email: 'sales@udevs.com',
    password: 'Sales@123',
    userType: 'sales',
    phone: '03212345678',
    cnic: '23456-7890123-4',
    status: 'active',
  },
  {
    name: 'Inventory Manager',
    firstName: 'Inventory',
    lastName: 'Manager',
    email: 'inventory@udevs.com',
    password: 'Inventory@123',
    userType: 'inventory',
    phone: '03213456789',
    cnic: '34567-8901234-5',
    status: 'active',
  },
  {
    name: 'John Customer',
    firstName: 'John',
    lastName: 'Customer',
    email: 'customer@udevs.com',
    password: 'Customer@123',
    userType: 'customer',
    phone: '03214567890',
    cnic: '45678-9012345-6',
    address: '123 Main Street, Lahore',
    city: 'Lahore',
    status: 'active',
  },
  {
    name: 'Team Lead',
    firstName: 'Team',
    lastName: 'Lead',
    email: 'lead@udevs.com',
    password: 'Lead@1234',
    userType: 'teamlead',
    phone: '03215678901',
    cnic: '56789-0123456-7',
    status: 'active',
    isTeamLead: true,
  },
];

/**
 * Insert any missing demo users. Existing emails are left untouched so
 * re-running the seeder never duplicates rows or resets passwords.
 */
const seedUsers = async () => {
  for (const item of demoUsers) {
    const exists = await User.findOne({ where: { email: item.email } });
    if (!exists) {
      await User.create(item);
      console.log(`Seeded user ${item.email}`);
    }
  }
};

// Allow `node src/seeders/seedUsers.js` for a standalone seed run.
if (require.main === module) {
  const { sequelize, initModels } = require('../models');
  (async () => {
    try {
      await sequelize.authenticate();
      await initModels();
      await seedUsers();
      console.log('Seed complete');
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

module.exports = { seedUsers, demoUsers };
