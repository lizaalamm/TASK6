export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateCNIC = (cnic) => {
  const re = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
  return re.test(cnic);
};

export const validatePhone = (phone) => {
  const re = /^03[0-9]{2}-[0-9]{7}$/;
  return re.test(phone);
};

export const validateNonNegativeNumber = (value) => {
  return !isNaN(value) && value >= 0;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};