/**
 * backend/src/seeders/seedShowroom.js
 * ----------------------------------------------------------------------------
 * Demo showroom catalogue (vehicles) + one PENDING application for the demo
 * customer, so the application-to-delivery pipeline is testable on first boot.
 *
 * Idempotent: vehicles are seeded once (skipped when any exist); the demo
 * application is seeded once per customer (skipped when one already exists).
 * ----------------------------------------------------------------------------
 */
const { User, Vehicle, Application } = require('../models');

const demoVehicles = [
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2025,
    variant: 'Grande',
    purchaseRate: 6500000,
    sellingPrice: 7250000,
    availableColors: ['White', 'Black', 'Silver', 'Blue'],
    stockQuantity: 5,
    fuel: 'Petrol',
    transmission: 'Auto',
    mileage: 0,
    engine: '1800cc',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    description: 'The Toyota Corolla Grande offers premium comfort and advanced safety features.',
    status: 'Available',
    supplierName: 'Toyota Motors Pakistan',
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2026,
    variant: 'VTi',
    purchaseRate: 6800000,
    sellingPrice: 7600000,
    availableColors: ['White', 'Black', 'Silver', 'Red'],
    stockQuantity: 3,
    fuel: 'Petrol',
    transmission: 'Auto',
    mileage: 0,
    engine: '1500cc',
    images: ['https://images.unsplash.com/photo-1590362891991-f776e747a589?w=800'],
    description: 'The Honda Civic VTi combines sporty design with excellent fuel efficiency.',
    status: 'Available',
    supplierName: 'Honda Atlas Cars',
  },
  {
    make: 'Suzuki',
    model: 'Swift',
    year: 2025,
    variant: 'GLX',
    purchaseRate: 3800000,
    sellingPrice: 4200000,
    availableColors: ['White', 'Silver', 'Blue', 'Red'],
    stockQuantity: 8,
    fuel: 'Petrol',
    transmission: 'Manual',
    mileage: 0,
    engine: '1200cc',
    images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800'],
    description: 'The Suzuki Swift GLX is a compact hatchback with sporty performance.',
    status: 'Available',
    supplierName: 'Suzuki Motors',
  },
  {
    make: 'Kia',
    model: 'Sportage',
    year: 2026,
    variant: 'AWD',
    purchaseRate: 9200000,
    sellingPrice: 10200000,
    availableColors: ['White', 'Black', 'Silver', 'Blue', 'Red'],
    stockQuantity: 2,
    fuel: 'Petrol',
    transmission: 'Auto',
    mileage: 0,
    engine: '2000cc',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    description: 'The Kia Sportage AWD offers premium SUV experience with advanced technology.',
    status: 'Available',
    supplierName: 'Kia Lucky Motors',
  },
  {
    make: 'Hyundai',
    model: 'Elantra',
    year: 2025,
    variant: 'GLS',
    purchaseRate: 5500000,
    sellingPrice: 6200000,
    availableColors: ['White', 'Silver', 'Blue'],
    stockQuantity: 4,
    fuel: 'Petrol',
    transmission: 'Auto',
    mileage: 0,
    engine: '1600cc',
    images: ['https://images.unsplash.com/photo-1541899481282-d53b7453a2ab?w=800'],
    description: 'The Hyundai Elantra GLS is a stylish sedan with modern features.',
    status: 'Available',
    supplierName: 'Hyundai Nishat',
  },
];

/**
 * Insert demo vehicles + one demo application. Safe to run on every boot.
 */
const seedShowroom = async () => {
  const vehicleCount = await Vehicle.count();
  if (vehicleCount === 0) {
    await Vehicle.bulkCreate(demoVehicles);
    console.log(`Seeded ${demoVehicles.length} demo vehicles`);
  }

  // One PENDING application so Super Admin has a review queue on first boot.
  const customer = await User.findOne({ where: { email: 'customer@udevs.com' } });
  if (customer) {
    const existing = await Application.count({ where: { customerId: customer.id } });
    if (existing === 0) {
      const vehicle = await Vehicle.findOne({ order: [['id', 'ASC']] });
      await Application.create({
        customerId: customer.id,
        firstName: customer.firstName || 'John',
        lastName: customer.lastName || 'Customer',
        email: customer.email,
        phone: customer.phone,
        cnic: customer.cnic,
        address: customer.address,
        city: customer.city,
        carMake: vehicle?.make || 'Toyota',
        carModel: vehicle?.model || 'Corolla',
        carVariant: vehicle?.variant || 'Grande',
        selectedColor: 'White',
        notes: 'Interested in test drive',
        status: 'PENDING',
      });
      console.log('Seeded demo application for customer@udevs.com');
    }
  }
};

// Allow `node src/seeders/seedShowroom.js` for a standalone seed run.
if (require.main === module) {
  const { sequelize, initModels } = require('../models');
  const { seedUsers } = require('./seedUsers');
  (async () => {
    try {
      await sequelize.authenticate();
      await initModels();
      await seedUsers();
      await seedShowroom();
      console.log('Showroom seed complete');
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

module.exports = { seedShowroom, demoVehicles };
