export const getData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

export const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
    return false;
  }
};

export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
    return false;
  }
};

export const clearData = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

export const seedInitialData = (seedData) => {
  try {
    let hasNewData = false;
    Object.keys(seedData).forEach((key) => {
      if (!localStorage.getItem(key)) {
        setData(key, seedData[key]);
        hasNewData = true;
        console.log(`Seeded ${key} with ${seedData[key].length} items`);
      }
    });
    return hasNewData;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
};

// Check if data exists
export const hasData = (key) => {
  return localStorage.getItem(key) !== null;
};