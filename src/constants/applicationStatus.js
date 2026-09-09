/**
 * src/constants/applicationStatus.js
 * ----------------------------------------------------------------------------
 * Frontend mirror of the application-to-delivery state flow
 * (`backend/src/constants/applicationStatus.js`, spec §8).
 *
 * Steps: 1 PENDING → 2 APPROVED/REJECTED → 3 ASSIGNED → 4 IN_PROCESS →
 * 5 VEHICLE_SELECTED → 6 FINANCE_SETUP → 7 PAYMENT_IN_PROGRESS →
 * 8 READY_FOR_DELIVERY → 9 COMPLETE
 *
 * Legacy localStorage rows use Title Case (`Pending`, `Approved`, `Reserved`,
 * `Completed`, `Rejected`) — `normalizeStatus()` maps everything to the
 * canonical UPPER_SNAKE form so old + new rows render identically.
 * ----------------------------------------------------------------------------
 */
import { ROLES, getUserRole } from './roles';

/** Every application status in the delivery pipeline. */
export const APPLICATION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROCESS: 'IN_PROCESS',
  VEHICLE_SELECTED: 'VEHICLE_SELECTED',
  FINANCE_SETUP: 'FINANCE_SETUP',
  PAYMENT_IN_PROGRESS: 'PAYMENT_IN_PROGRESS',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  COMPLETE: 'COMPLETE',
});

export const ALL_STATUSES = Object.freeze(Object.values(APPLICATION_STATUS));

/** Display metadata per status (labels, step number, owning actor, colour). */
export const STATUS_META = Object.freeze({
  [APPLICATION_STATUS.PENDING]: {
    label: 'Pending', step: 1, actor: 'Customer / Super Admin', color: 'warning',
    description: 'Application submitted, awaiting Super Admin review.',
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: 'Approved', step: 2, actor: 'Super Admin', color: 'info',
    description: 'Documents verified by Super Admin, awaiting manager assignment.',
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected', step: 2, actor: 'Super Admin', color: 'error',
    description: 'Application rejected by Super Admin.',
  },
  [APPLICATION_STATUS.ASSIGNED]: {
    label: 'Assigned', step: 3, actor: 'Super Admin', color: 'info',
    description: 'Manager assigned by Super Admin.',
  },
  [APPLICATION_STATUS.IN_PROCESS]: {
    label: 'In Process', step: 4, actor: 'Manager', color: 'primary',
    description: 'Manager is verifying customer and documents.',
  },
  [APPLICATION_STATUS.VEHICLE_SELECTED]: {
    label: 'Vehicle Selected', step: 5, actor: 'Manager + Customer', color: 'primary',
    description: 'Vehicle chosen for the application.',
  },
  [APPLICATION_STATUS.FINANCE_SETUP]: {
    label: 'Finance Setup', step: 6, actor: 'Manager / Super Admin', color: 'secondary',
    description: 'Down payment and installment plan configured.',
  },
  [APPLICATION_STATUS.PAYMENT_IN_PROGRESS]: {
    label: 'Payment In Progress', step: 7, actor: 'Manager / Admin / Super Admin', color: 'warning',
    description: 'Payments are being recorded against the plan.',
  },
  [APPLICATION_STATUS.READY_FOR_DELIVERY]: {
    label: 'Ready for Delivery', step: 8, actor: 'Authorized role', color: 'success',
    description: 'All conditions met, vehicle ready to hand over.',
  },
  [APPLICATION_STATUS.COMPLETE]: {
    label: 'Complete', step: 9, actor: 'Super Admin', color: 'success',
    description: 'Order completed by Super Admin.',
  },
});

/** Ordered pipeline steps for steppers / timelines. */
export const STATUS_FLOW = Object.freeze([
  APPLICATION_STATUS.PENDING,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.ASSIGNED,
  APPLICATION_STATUS.IN_PROCESS,
  APPLICATION_STATUS.VEHICLE_SELECTED,
  APPLICATION_STATUS.FINANCE_SETUP,
  APPLICATION_STATUS.PAYMENT_IN_PROGRESS,
  APPLICATION_STATUS.READY_FOR_DELIVERY,
  APPLICATION_STATUS.COMPLETE,
]);

/**
 * Normalise any raw status (legacy Title Case, any casing) to canonical form.
 * @param {string} value - Raw status.
 * @returns {string} Canonical status (defaults to PENDING when unknown).
 */
export const normalizeStatus = (value) => {
  if (!value) return APPLICATION_STATUS.PENDING;
  const raw = String(value).trim().toUpperCase().replace(/[\s-]+/g, '_');
  const aliases = {
    PENDING: APPLICATION_STATUS.PENDING,
    APPROVED: APPLICATION_STATUS.APPROVED,
    REJECTED: APPLICATION_STATUS.REJECTED,
    ASSIGNED: APPLICATION_STATUS.ASSIGNED,
    IN_PROCESS: APPLICATION_STATUS.IN_PROCESS,
    INPROCESS: APPLICATION_STATUS.IN_PROCESS,
    VEHICLE_SELECTED: APPLICATION_STATUS.VEHICLE_SELECTED,
    VEHICLESELECTED: APPLICATION_STATUS.VEHICLE_SELECTED,
    FINANCE_SETUP: APPLICATION_STATUS.FINANCE_SETUP,
    FINANCESETUP: APPLICATION_STATUS.FINANCE_SETUP,
    PAYMENT_IN_PROGRESS: APPLICATION_STATUS.PAYMENT_IN_PROGRESS,
    PAYMENTINPROGRESS: APPLICATION_STATUS.PAYMENT_IN_PROGRESS,
    READY_FOR_DELIVERY: APPLICATION_STATUS.READY_FOR_DELIVERY,
    READYFORDELIVERY: APPLICATION_STATUS.READY_FOR_DELIVERY,
    READY: APPLICATION_STATUS.READY_FOR_DELIVERY,
    COMPLETE: APPLICATION_STATUS.COMPLETE,
    COMPLETED: APPLICATION_STATUS.COMPLETE,
    RESERVED: APPLICATION_STATUS.VEHICLE_SELECTED,
  };
  return aliases[raw] || APPLICATION_STATUS.PENDING;
};

/** Pretty label for any raw status value. */
export const statusLabel = (value) =>
  STATUS_META[normalizeStatus(value)]?.label || String(value || 'Pending');

/** MUI chip colour for any raw status value. */
export const statusColor = (value) =>
  STATUS_META[normalizeStatus(value)]?.color || 'default';

/** Pipeline step number (1-9) for any raw status value. */
export const statusStep = (value) =>
  STATUS_META[normalizeStatus(value)]?.step || 1;

/**
 * Next actions the CURRENT user may take on an application row.
 * Mirrors the backend transition actors (UI visibility only).
 * @param {object|null} user - Logged-in user.
 * @param {object} app - Application row (any status casing).
 * @returns {string[]} Action keys: review, assign, verify, vehicle, finance,
 *   payment, ready, complete, resubmit.
 */
export const availableActionsFor = (user, app) => {
  if (!app) return [];
  const role = getUserRole(user);
  if (!role) return [];
  const status = normalizeStatus(app.status);
  const isSuper = role === ROLES.SUPERADMIN;
  const isAssignedManager =
    role === ROLES.MANAGER && String(app.managerId) === String(user?.id);
  const isOwner =
    role === ROLES.CUSTOMER && String(app.customerId) === String(user?.id);
  const actions = [];

  if (status === APPLICATION_STATUS.PENDING && isSuper) actions.push('review');
  if (status === APPLICATION_STATUS.APPROVED && isSuper) actions.push('assign', 'review');
  if (status === APPLICATION_STATUS.REJECTED && (isSuper || isOwner)) actions.push('resubmit');
  if (status === APPLICATION_STATUS.ASSIGNED && (isSuper || isAssignedManager)) actions.push('verify');
  if (
    status === APPLICATION_STATUS.IN_PROCESS &&
    (isSuper || isAssignedManager || isOwner)
  ) {
    actions.push('vehicle');
  }
  if (status === APPLICATION_STATUS.VEHICLE_SELECTED && (isSuper || isAssignedManager)) {
    actions.push('finance');
  }
  if (
    [APPLICATION_STATUS.FINANCE_SETUP, APPLICATION_STATUS.PAYMENT_IN_PROGRESS].includes(status) &&
    (isSuper || role === ROLES.ADMIN || isAssignedManager)
  ) {
    actions.push('payment');
  }
  if (status === APPLICATION_STATUS.PAYMENT_IN_PROGRESS && (isSuper || isAssignedManager)) {
    actions.push('ready');
  }
  if (status === APPLICATION_STATUS.READY_FOR_DELIVERY && isSuper) actions.push('complete');
  return actions;
};
