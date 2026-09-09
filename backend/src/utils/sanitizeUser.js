/**
 * backend/src/utils/sanitizeUser.js
 * ----------------------------------------------------------------------------
 * Strip secrets off a user before it leaves the API. ALWAYS run users through
 * this before `res.json(...)` — raw Sequelize rows contain the bcrypt hash.
 * ----------------------------------------------------------------------------
 */

/**
 * Remove the password hash and guarantee a `role` alias field.
 * @param {User|object|null} user - Sequelize instance or plain object.
 * @returns {object|null} Client-safe user object (or null passthrough).
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete json.password; // NEVER expose the hash
  json.role = json.role || json.userType; // frontend accepts either key
  return json;
};

module.exports = { sanitizeUser };
