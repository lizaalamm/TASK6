import { getData, setData, generateId } from './localStorage';

export const getApplications = () => {
  return getData('udevs_applications', []);
};

export const getApplicationById = (id) => {
  const applications = getApplications();
  return applications.find(app => app.id === id) || null;
};

export const getApplicationsByCustomer = (customerId) => {
  const applications = getApplications();
  return applications.filter(app => app.customerId === customerId);
};

export const addApplication = (applicationData) => {
  const applications = getApplications();
  const newApplication = {
    id: generateId('APP'),
    ...applicationData,
    status: 'Pending',
    applicationDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  applications.push(newApplication);
  setData('udevs_applications', applications);
  return newApplication;
};

export const updateApplicationStatus = (id, status) => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === id);
  if (index === -1) return null;
  
  const updatedApplication = {
    ...applications[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  applications[index] = updatedApplication;
  setData('udevs_applications', applications);
  return updatedApplication;
};

export const updateApplication = (id, applicationData) => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === id);
  if (index === -1) return null;
  
  const updatedApplication = {
    ...applications[index],
    ...applicationData,
    updatedAt: new Date().toISOString(),
  };
  applications[index] = updatedApplication;
  setData('udevs_applications', applications);
  return updatedApplication;
};

export const deleteApplication = (id) => {
  const applications = getApplications();
  const filtered = applications.filter(app => app.id !== id);
  setData('udevs_applications', filtered);
  return true;
};

export const getApplicationStats = () => {
  const applications = getApplications();
  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    approved: applications.filter(app => app.status === 'Approved').length,
    reserved: applications.filter(app => app.status === 'Reserved').length,
    completed: applications.filter(app => app.status === 'Completed').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
  };
};