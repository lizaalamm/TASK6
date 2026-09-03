const sanitizeUser = (user) => {
  if (!user) return null;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  delete json.password;
  json.role = json.role || json.userType;
  return json;
};

module.exports = { sanitizeUser };
