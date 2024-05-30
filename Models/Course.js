const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Import the Sequelize instance
const Domains = require('./Domain'); // Import the Domains model
 // Import the Users model
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  d_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Domains',
      key: 'id',
    },
  },
  u_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  c_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  c_details: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  timing_from: {
    type: DataTypes.TIME,
  },
  timing_to: {
    type: DataTypes.TIME,
  },
  start_date: {
    type: DataTypes.DATE,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  c_duration: {
    type: DataTypes.STRING(255),
  },
});


module.exports = Course;
