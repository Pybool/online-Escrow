const Sequelize = require('sequelize');
var SqlString = require('sqlstring');

var sequelize = new Sequelize('escrow', 'root', 'blackcode', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  storage: 'path/to/database.sqlite',

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

module.exports=  { sequelize }