import { getData, setData, generateId } from './localStorage';
import { calculateProfit, calculateProfitMargin } from '../utils/calculations';

export const getCars = () => {
  return getData('udevs_cars', []);
};

export const getCarById = (id) => {
  const cars = getCars();
  return cars.find(car => car.id === id) || null;
};

export const addCar = (carData) => {
  const cars = getCars();
  const newCar = {
    id: generateId('CAR'),
    ...carData,
    profit: calculateProfit(carData.sellingPrice, carData.purchaseRate),
    profitMargin: calculateProfitMargin(carData.sellingPrice, carData.purchaseRate),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cars.push(newCar);
  setData('udevs_cars', cars);
  return newCar;
};

export const updateCar = (id, carData) => {
  const cars = getCars();
  const index = cars.findIndex(car => car.id === id);
  if (index === -1) return null;
  
  const updatedCar = {
    ...cars[index],
    ...carData,
    profit: calculateProfit(carData.sellingPrice || cars[index].sellingPrice, carData.purchaseRate || cars[index].purchaseRate),
    profitMargin: calculateProfitMargin(carData.sellingPrice || cars[index].sellingPrice, carData.purchaseRate || cars[index].purchaseRate),
    updatedAt: new Date().toISOString(),
  };
  cars[index] = updatedCar;
  setData('udevs_cars', cars);
  return updatedCar;
};

export const deleteCar = (id) => {
  const cars = getCars();
  const filtered = cars.filter(car => car.id !== id);
  setData('udevs_cars', filtered);
  return true;
};

export const getAvailableCars = () => {
  const cars = getCars();
  return cars.filter(car => car.status === 'Available' && car.stockQuantity > 0);
};

export const getCarsBySupplier = (supplierId) => {
  const cars = getCars();
  return cars.filter(car => car.supplierId === supplierId);
};

export const searchCars = (query) => {
  const cars = getCars();
  if (!query) return cars;
  const lowerQuery = query.toLowerCase();
  return cars.filter(car =>
    car.make.toLowerCase().includes(lowerQuery) ||
    car.model.toLowerCase().includes(lowerQuery) ||
    car.variant.toLowerCase().includes(lowerQuery) ||
    car.id.toLowerCase().includes(lowerQuery)
  );
};

export const filterCars = (filters) => {
  let cars = getCars();
  
  if (filters.status) {
    cars = cars.filter(car => car.status === filters.status);
  }
  if (filters.minPrice) {
    cars = cars.filter(car => car.sellingPrice >= filters.minPrice);
  }
  if (filters.maxPrice) {
    cars = cars.filter(car => car.sellingPrice <= filters.maxPrice);
  }
  if (filters.year) {
    cars = cars.filter(car => car.year === filters.year);
  }
  if (filters.fuel) {
    cars = cars.filter(car => car.fuel === filters.fuel);
  }
  if (filters.color) {
    cars = cars.filter(car => car.availableColors.includes(filters.color));
  }
  if (filters.supplierId) {
    cars = cars.filter(car => car.supplierId === filters.supplierId);
  }
  
  return cars;
};