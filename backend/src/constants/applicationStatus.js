/**
 * backend/src/constants/applicationStatus.js
 * ----------------------------------------------------------------------------
 * Application-to-Delivery state flow (U Devs spec §8).
 *
 * | Step | Actor              | Status / Action              |
 * |------|--------------------|------------------------------|
 * | 1    | Customer           | Create application → PENDING |
 * | 2    | Super Admin        | Review → PENDING/APPROVED/   |
 * |      |                    | REJECTED                     |
 * | 3    | Super Admin        | Assign Manager → ASSIGNED    |
 * | 4    | Manager            | Verify docs → IN_PROCESS     |
 * | 5    | Manager + Customer | Select vehicle →             |
 * |      |                    | VEHICLE_SELECTED             |
 * | 6    | Manager/SuperAdmin | Finance plan → FINANCE_SETUP |
 * | 7    | Manager/Admin/     | Record payment →             |
 * |      | Super Admin        | PAYMENT_IN_PROGRESS          |
 * | 8    | Authorized role    | Conditions met →             |
 * |      |                    | READY_FOR_DELIVERY           |
 * | 9    | Super Admin        | Complete order → COMPLETE    |
 *
 * Guards enforced server-side:
 *  - Only legal transitions (ALLOWED_TRANSITIONS) are accepted.
 *  - Only authorised actors (TRANSITION_ACTORS) may perform each step.
 *  - Managers act ONLY on applications assigned to them (managerId match).
 *  - Customers act ONLY on their own applications (customerId match).
 * ----------------------------------------------------------------------------
 */
const { ROLES } = require('./roles');

/** Every application status in the delivery pipeline. */
const APPLICATION_STATUS = Object.freeze({
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

const ALL_STATUSES = Object.freeze(Object.values(APPLICATION_STATUS));

/** Display metadata per status (labels, step number, owning actor). */
const STATUS_META = Object.freeze({
  [APPLICATION_STATUS.PENDING]: {
    label: 'Pending',
    step: 1,
    actor: 'Customer / Super Admin',
    color: 'warning',
    description: 'Application submitted, awaiting Super Admin review.',
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: 'Approved',
    step: 2,
    actor: 'Super Admin',
    color: 'info',
    description: 'Documents verified by Super Admin, awaiting manager assignment.',
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected',
    step: 2,
    actor: 'Super Admin',
    color: 'error',
    description: 'Application rejected by Super Admin.',
  },
  [APPLICATION_STATUS.ASSIGNED]: {
    label: 'Assigned',
    step: 3,
    actor: 'Super Admin',
    color: 'info',
    description: 'Manager assigned by Super Admin.',
  },
  [APPLICATION_STATUS.IN_PROCESS]: {
    label: 'In Process',
    step: 4,
    actor: 'Manager',
    color: 'primary',
    description: 'Manager is verifying customer and documents.',
  },
  [APPLICATION_STATUS.VEHICLE_SELECTED]: {
    label: 'Vehicle Selected',
    step: 5,
    actor: 'Manager + Customer',
    color: 'primary',
    description: 'Vehicle chosen for the application.',
  },
  [APPLICATION_STATUS.FINANCE_SETUP]: {
    label: 'Finance Setup',
    step: 6,
    actor: 'Manager / Super Admin',
    color: 'secondary',
    description: 'Down payment and installment plan configured.',
  },
  [APPLICATION_STATUS.PAYMENT_IN_PROGRESS]: {
    label: 'Payment In Progress',
    step: 7,
    actor: 'Manager / Admin / Super Admin',
    color: 'warning',
    description: 'Payments are being recorded against the plan.',
  },
  [APPLICATION_STATUS.READY_FOR_DELIVERY]: {
    label: 'Ready for Delivery',
    step: 8,
    actor: 'Authorized role',
    color: 'success',
    description: 'All conditions met, vehicle ready to hand over.',
  },
  [APPLICATION_STATUS.COMPLETE]: {
    label: 'Complete',
    step: 9,
    actor: 'Super Admin',
    color: 'success',
    description: 'Order completed by Super Admin.',
  },
});

/** Legal next statuses for every status. */
const ALLOWED_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.PENDING]: [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.APPROVED]: [APPLICATION_STATUS.ASSIGNED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.REJECTED]: [APPLICATION_STATUS.PENDING], // customer may resubmit
  [APPLICATION_STATUS.ASSIGNED]: [APPLICATION_STATUS.IN_PROCESS],
  [APPLICATION_STATUS.IN_PROCESS]: [APPLICATION_STATUS.VEHICLE_SELECTED],
  [APPLICATION_STATUS.VEHICLE_SELECTED]: [APPLICATION_STATUS.FINANCE_SETUP],
  [APPLICATION_STATUS.FINANCE_SETUP]: [APPLICATION_STATUS.PAYMENT_IN_PROGRESS],
  [APPLICATION_STATUS.PAYMENT_IN_PROGRESS]: [
    APPLICATION_STATUS.PAYMENT_IN_PROGRESS, // further payments keep the state
    APPLICATION_STATUS.READY_FOR_DELIVERY,
  ],
  [APPLICATION_STATUS.READY_FOR_DELIVERY]: [APPLICATION_STATUS.COMPLETE],
  [APPLICATION_STATUS.COMPLETE]: [],
});

/** Roles allowed to perform each transition (`from->to`). */
const TRANSITION_ACTORS = Object.freeze({
  [`${APPLICATION_STATUS.PENDING}->${APPLICATION_STATUS.APPROVED}`]: [ROLES.SUPERADMIN],
  [`${APPLICATION_STATUS.PENDING}->${APPLICATION_STATUS.REJECTED}`]: [ROLES.SUPERADMIN],
  [`${APPLICATION_STATUS.APPROVED}->${APPLICATION_STATUS.ASSIGNED}`]: [ROLES.SUPERADMIN],
  [`${APPLICATION_STATUS.APPROVED}->${APPLICATION_STATUS.REJECTED}`]: [ROLES.SUPERADMIN],
  [`${APPLICATION_STATUS.REJECTED}->${APPLICATION_STATUS.PENDING}`]: [
    ROLES.SUPERADMIN,
    ROLES.CUSTOMER,
  ],
  [`${APPLICATION_STATUS.ASSIGNED}->${APPLICATION_STATUS.IN_PROCESS}`]: [
    ROLES.SUPERADMIN,
    ROLES.MANAGER,
  ],
  [`${APPLICATION_STATUS.IN_PROCESS}->${APPLICATION_STATUS.VEHICLE_SELECTED}`]: [
    ROLES.SUPERADMIN,
    ROLES.MANAGER,
    ROLES.CUSTOMER,
  ],
  [`${APPLICATION_STATUS.VEHICLE_SELECTED}->${APPLICATION_STATUS.FINANCE_SETUP}`]: [
    ROLES.SUPERADMIN,
    ROLES.MANAGER,
  ],
  [`${APPLICATION_STATUS.FINANCE_SETUP}->${APPLICATION_STATUS.PAYMENT_IN_PROGRESS}`]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ],
  [`${APPLICATION_STATUS.PAYMENT_IN_PROGRESS}->${APPLICATION_STATUS.PAYMENT_IN_PROGRESS}`]: [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
  ],
  [`${APPLICATION_STATUS.PAYMENT_IN_PROGRESS}->${APPLICATION_STATUS.READY_FOR_DELIVERY}`]: [
    ROLES.SUPERADMIN,
    ROLES.MANAGER,
  ],
  [`${APPLICATION_STATUS.READY_FOR_DELIVERY}->${APPLICATION_STATUS.COMPLETE}`]: [ROLES.SUPERADMIN],
});

/**
 * Normalise any raw status (legacy Title Case, any casing) to canonical form.
 * @param {string} value - Raw status.
 * @returns {string|undefined} Canonical status or undefined when unknown.
 */
const normalizeStatus = (value) => {
  if (!value) return undefined;
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
    RESERVED: APPLICATION_STATUS.VEHICLE_SELECTED, // legacy localStorage status
  };
  return aliases[raw];
};

/**
 * Check whether a transition is legal AND the actor role may perform it.
 * @param {string} from - Current status.
 * @param {string} to - Desired status.
 * @param {string} actorRole - Canonical role of the actor.
 * @returns {{ok: boolean, reason?: string}}
 */
const canTransition = (from, to, actorRole) => {
  const current = normalizeStatus(from);
  const next = normalizeStatus(to);
  if (!current || !next) return { ok: false, reason: 'Unknown status value' };
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    return { ok: false, reason: `Cannot move application from ${current} to ${next}` };
  }
  const role = String(actorRole || '').toLowerCase();
  if (role === ROLES.SUPERADMIN) return { ok: true };
  const actors = TRANSITION_ACTORS[`${current}->${next}`] || [];
  if (!actors.includes(role)) {
    return { ok: false, reason: `Role '${role}' cannot move application from ${current} to ${next}` };
  }
  return { ok: true };
};

module.exports = {
  APPLICATION_STATUS,
  ALL_STATUSES,
  STATUS_META,
  ALLOWED_TRANSITIONS,
  TRANSITION_ACTORS,
  normalizeStatus,
  canTransition,
};
