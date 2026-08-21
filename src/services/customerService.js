import { getData, setData, generateId } from './localStorage';

export const getCustomers = () => {
  return getData('udevs_customers', []);
};

export const getCustomerById = (id) => {
  const customers = getCustomers();
  return customers.find(customer => customer.id === id) || null;
};

export const getCustomerByEmail = (email) => {
  const customers = getCustomers();
  return customers.find(customer => customer.email === email) || null;
};

export const addCustomer = (customerData) => {
  const customers = getCustomers();
  const newCustomer = {
    id: generateId('CUS'),
    ...customerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  setData('udevs_customers', customers);
  return newCustomer;
};

export const updateCustomer = (id, customerData) => {
  const customers = getCustomers();
  const index = customers.findIndex(customer => customer.id === id);
  if (index === -1) return null;
  
  const updatedCustomer = {
    ...customers[index],
    ...customerData,
    updatedAt: new Date().toISOString(),
  };
  customers[index] = updatedCustomer;
  setData('udevs_customers', customers);
  return updatedCustomer;
};

export const deleteCustomer = (id) => {
  const customers = getCustomers();
  const filtered = customers.filter(customer => customer.id !== id);
  setData('udevs_customers', filtered);
  return true;
};