export const calculateProfit = (sellingPrice, purchaseRate) => {
  if (!sellingPrice || !purchaseRate) return 0;
  return sellingPrice - purchaseRate;
};

export const calculateProfitMargin = (sellingPrice, purchaseRate) => {
  if (!sellingPrice || sellingPrice === 0) return 0;
  const profit = calculateProfit(sellingPrice, purchaseRate);
  return (profit / sellingPrice) * 100;
};

export const getProfitMarginLevel = (margin) => {
  if (margin >= 25) return 'High';
  if (margin >= 15) return 'Medium';
  return 'Low';
};

export const getStatusColor = (status) => {
  const colors = {
    'Available': 'success',
    'Reserved': 'warning',
    'Sold': 'error',
    'Inactive': 'default',
    'Pending': 'warning',
    'Approved': 'info',
    'Completed': 'success',
    'Rejected': 'error',
  };
  return colors[status] || 'default';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};