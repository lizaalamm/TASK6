const sequelize = require('../config/db');
const User = require('./userModel');

User.belongsTo(User, {
  as: 'teamLead',
  foreignKey: 'teamLeadId',
  constraints: false,
});

User.hasMany(User, {
  as: 'teamMembers',
  foreignKey: 'teamLeadId',
  constraints: false,
});

const initModels = async () => {
  const dialect = sequelize.getDialect();
  if (dialect === 'sqlite') {
    await sequelize.sync();
  } else {
    await sequelize.sync({ alter: true });
  }
};

module.exports = {
  sequelize,
  User,
  initModels,
};
