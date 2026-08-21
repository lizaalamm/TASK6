import { getData, setData, generateId } from './localStorage';

export const getSuppliers = () => {
  return getData('udevs_suppliers', []);
};

export const getSupplierById = (id) => {
  const suppliers = getSuppliers();
  return suppliers.find(supplier => supplier.id === id) || null;
};

export const addSupplier = (supplierData) => {
  const suppliers = getSuppliers();
  const newSupplier = {
    id: generateId('SUP'),
    ...supplierData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  suppliers.push(newSupplier);
  setData('udevs_suppliers', suppliers);
  return newSupplier;
};

export const updateSupplier = (id, supplierData) => {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(supplier => supplier.id === id);
  if (index === -1) return null;
  
  const updatedSupplier = {
    ...suppliers[index],
    ...supplierData,
    updatedAt: new Date().toISOString(),
  };
  suppliers[index] = updatedSupplier;
  setData('udevs_suppliers', suppliers);
  return updatedSupplier;
};

export const deleteSupplier = (id) => {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter(supplier => supplier.id !== id);
  setData('udevs_suppliers', filtered);
  return true;
};

export const getActiveSuppliers = () => {
  const suppliers = getSuppliers();
  return suppliers.filter(supplier => supplier.status === 'Active');
};