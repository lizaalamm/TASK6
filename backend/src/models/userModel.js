/**
 * backend/src/models/userModel.js
 * ----------------------------------------------------------------------------
 * Sequelize `User` model — the single accounts table for the whole platform.
 *
 * Key behaviours:
 *  - `email` is always stored lowercase + trimmed (see `beforeValidate` hook).
 *  - `password` is NEVER stored plain — it is bcrypt-hashed on create/update.
 *  - `userType` is the real role column; `role` is a virtual alias so the
 *    frontend can use either `user.role` or `user.userType`.
 *  - `teamLeadId` links an employee to their team lead (self relation).
 * ----------------------------------------------------------------------------
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// Pure-JS bcrypt (drop-in API for genSalt/hash/compare) — no native build
// step, so `npm install` works on any Node version / OS incl. Windows.
const bcrypt = require('bcryptjs');
const { ALLOWED_TYPES } = require('../constants/roles');

const User = sequelize.define(
  'User',
  {
    // Auto-increment primary key.
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Display name shown across the UI.
    name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    // Unique login identifier (normalised to lowercase).
    email: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    // Optional FK → another User row acting as this user's team lead.
    teamLeadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // bcrypt hash — never select/return this to clients.
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Optional avatar image (URL or base64 payload).
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Pakistani CNIC — either `XXXXX-XXXXXXX-X` or 13 plain digits.
    cnic: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: [/^\d{5}-\d{7}-\d{1}$|^\d{13}$/],
          msg: 'CNIC must be in the format XXXXX-XXXXXXX-X or XXXXXXXXXXXXXX',
        },
        // Extra guard so partially-typed CNICs fail with a clear message.
        customCnicValidation(value) {
          if (value && !/^\d{5}-\d{7}-\d{1}$|^\d{13}$/.test(value)) {
            throw new Error(
              'Invalid CNIC format. It must be XXXXX-XXXXXXX-X or XXXXXXXXXXXXXX.'
            );
          }
        },
      },
    },
    // Stored CNIC document images (front / back).
    cnic_front: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cnic_back: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Pakistani mobile: `03001234567` or `+923001234567`.
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: [/^(03\d{9}|\+92\d{10})$/],
          msg: 'Phone number must be in the format "+923000000000" or "03000000000".',
        },
      },
    },
    /**
     * The user's role. `superadmin` is the platform owner and outranks `admin`.
     * NOTE: on PostgreSQL this is a native ENUM — when a new value is added,
     * `models/index.js` runs `ALTER TYPE ... ADD VALUE IF NOT EXISTS` first
     * so `sync({ alter: true })` never crashes on existing databases.
     */
    userType: {
      type: DataTypes.ENUM(...ALLOWED_TYPES),
      allowNull: false,
      defaultValue: 'employee',
    },
    // HR-style dates for staff lifecycle tracking.
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    terminatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Soft on/off switch — inactive users cannot log in.
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    // Quick flag so we can query "all team leads" without a join.
    isTeamLead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Hard ban flag — terminated users cannot log in even if active.
    isTerminated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Virtual read-only alias: `user.role` === `user.userType`.
    role: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('userType');
      },
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
    hooks: {
      // Normalise email + phone BEFORE validation runs.
      beforeValidate: (user) => {
        if (user.email) {
          user.email = String(user.email).trim().toLowerCase();
        }
        if (user.phone) {
          user.phone = String(user.phone).replace(/\s+/g, '');
        }
      },
      // Hash the password when a row is first created.
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Re-hash ONLY when the password field actually changed.
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

/**
 * Compare a plain-text login password against the stored bcrypt hash.
 * @param {string} inputPassword - Password typed by the user.
 * @returns {Promise<boolean>} True when the password matches.
 */
User.prototype.checkPassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

/**
 * True for the platform owner. Superadmin bypasses every permission check.
 * @returns {boolean}
 */
User.prototype.isSuperAdmin = function () {
  return this.userType === 'superadmin';
};

/**
 * True for showroom managers AND the superadmin (who inherits admin rights).
 * @returns {boolean}
 */
User.prototype.isAdmin = function () {
  return this.userType === 'admin' || this.userType === 'superadmin';
};

/**
 * True for plain staff accounts.
 * @returns {boolean}
 */
User.prototype.isEmployee = function () {
  return this.userType === 'employee';
};

/**
 * Create a user row (password hashing happens via model hooks).
 * @param {object} userData - Validated user payload.
 * @returns {Promise<User>} The created user instance.
 */
User.createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Fetch every user WITHOUT password hashes.
 * @returns {Promise<User[]>} All users, newest last.
 */
User.getAllUsers = async () => {
  return User.findAll({ attributes: { exclude: ['password'] } });
};

/**
 * Fetch one user by id WITHOUT the password hash.
 * @param {number|string} id - User primary key.
 * @throws When no user exists with that id.
 * @returns {Promise<User>} The matching user.
 */
User.getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('User not found');
  return user;
};

/**
 * Patch a user row by id.
 * @param {number|string} id - User primary key.
 * @param {object} userData - Fields to update.
 * @throws When no user exists with that id.
 * @returns {Promise<User>} The updated user.
 */
User.updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.update(userData);
    return user;
  }
  throw new Error('User not found');
};

/**
 * Delete a user row by id.
 * @param {number|string} id - User primary key.
 * @throws When no user exists with that id.
 * @returns {Promise<boolean>} Always true on success.
 */
User.deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return true;
  }
  throw new Error('User not found');
};

/**
 * Fetch every user that has a given role (no password hashes).
 * @param {string} role - One of the ALLOWED_TYPES values.
 * @returns {Promise<User[]>} Matching users.
 */
User.getUsersByRole = async (role) => {
  return User.findAll({
    where: { userType: role },
    attributes: { exclude: ['password'] },
  });
};

/**
 * Check whether an email address is already registered (case-insensitive).
 * @param {string} email - Email to test.
 * @returns {Promise<boolean>} True when the email is taken.
 */
User.emailExists = async (email) => {
  const user = await User.findOne({ where: { email: String(email).trim().toLowerCase() } });
  return !!user;
};

module.exports = User;
