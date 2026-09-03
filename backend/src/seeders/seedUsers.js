const { User } = require('../models');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@udevs.com',
    password: 'Admin@123',
    userType: 'admin',
    phone: '03211234567',
    cnic: '12345-6789012-3',
    status: 'active',
  },
  {
    name: 'Sales Manager',
    email: 'sales@udevs.com',
    password: 'Sales@123',
    userType: 'sales',
    phone: '03212345678',
    cnic: '23456-7890123-4',
    status: 'active',
  },
  {
    name: 'Inventory Manager',
    email: 'inventory@udevs.com',
    password: 'Inventory@123',
    userType: 'inventory',
    phone: '03213456789',
    cnic: '34567-8901234-5',
    status: 'active',
  },
  {
    name: 'John Customer',
    email: 'customer@udevs.com',
    password: 'Customer@123',
    userType: 'customer',
    phone: '03214567890',
    cnic: '45678-9012345-6',
    status: 'active',
  },
  {
    name: 'Team Lead',
    email: 'lead@udevs.com',
    password: 'Lead@1234',
    userType: 'teamlead',
    phone: '03215678901',
    cnic: '56789-0123456-7',
    status: 'active',
    isTeamLead: true,
  },
];

const seedUsers = async () => {
  for (const item of demoUsers) {
    const exists = await User.findOne({ where: { email: item.email } });
    if (!exists) {
      await User.create(item);
      console.log(`Seeded user ${item.email}`);
    }
  }
};

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
