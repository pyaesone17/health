const Sequelize = require('sequelize');
const connection = new Sequelize('health', 'root', 'legendary16', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  storage: 'path/to/database.sqlite'
});


module.exports = connection;