/**
 * src/services/paymentService.js
 * ----------------------------------------------------------------------------
 * Payment data layer — async API first, localStorage (`udevs_payments`)
 * fallback. Recording a payment also refreshes the parent application row in
 * the local cache (paid/remaining totals) so finance screens stay accurate
 * offline.
 * ----------------------------------------------------------------------------
 */
import api from './api';
import { getData, setData, generateId } from './localStorage';
import { APPLICATION_STATUS } from '../constants/applicationStatus';
import { getApplicationById, updateApplication } from './applicationService';

const KEY = 'udevs_payments';
const unwrap = (response) => response.data?.data;

export const getPaymentsLocal = () => getData(KEY, []);

export const getPaymentsByApplicationLocal = (applicationId) => {
  const sid = String(applicationId);
  return getPaymentsLocal().filter((p) => String(p.applicationId) === sid);
};

export const getPaymentsByCustomerLocal = (customerId) => {
  const sid = String(customerId);
  return getPaymentsLocal().filter((p) => String(p.customerId) === sid);
};

const appendLocal = (payment) => {
  const rows = getPaymentsLocal();
  rows.unshift(payment);
  setData(KEY, rows);
  return payment;
};

/** Refresh the cached parent application after a local payment. */
const refreshLocalApplication = (applicationId, amount) => {
  const app = getApplicationById(applicationId);
  if (!app) return;
  const paidAmount = Number(app.paidAmount || 0) + Number(amount || 0);
  const remainingBalance = Math.max(0, Number(app.totalPayable || 0) - paidAmount);
  updateApplication(applicationId, {
    paidAmount,
    remainingBalance,
    status: APPLICATION_STATUS.PAYMENT_IN_PROGRESS,
  });
};

export const fetchPayments = async (params = {}) => {
  try {
    const rows = unwrap(await api.get('/payments', { params })) || [];
    return rows;
  } catch {
    let rows = getPaymentsLocal();
    if (params.applicationId) {
      rows = rows.filter((r) => String(r.applicationId) === String(params.applicationId));
    }
    return rows;
  }
};

export const fetchOverduePayments = async () => {
  try {
    return unwrap(await api.get('/payments/overdue')) || [];
  } catch {
    const now = new Date();
    return getPaymentsLocal().filter(
      (p) => ['pending', 'overdue'].includes(p.status) && p.dueDate && new Date(p.dueDate) < now
    );
  }
};

export const recordPayment = async ({ applicationId, amount, method = 'cash', type = 'installment', receiptNo = '', notes = '' }) => {
  try {
    const result = unwrap(
      await api.post('/payments', { applicationId, amount, method, type, receiptNo, notes })
    );
    return result;
  } catch {
    const app = getApplicationById(applicationId);
    const now = new Date().toISOString();
    const payment = appendLocal({
      id: generateId('PAY'),
      applicationId,
      customerId: app?.customerId,
      managerId: app?.managerId,
      amount: Number(amount),
      method,
      type,
      status: 'paid',
      paidAt: now,
      receiptNo: receiptNo || `RCP-${Date.now().toString(36).toUpperCase()}`,
      notes,
      createdAt: now,
    });
    refreshLocalApplication(applicationId, amount);
    const refreshed = getApplicationById(applicationId);
    return {
      payment,
      paidAmount: refreshed?.paidAmount || 0,
      remainingBalance: refreshed?.remainingBalance || 0,
    };
  }
};
