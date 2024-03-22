// models/Course.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Import the Sequelize instance

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  heading: {
    type: DataTypes.TEXT('long'),
  },
  description: {
    type: DataTypes.TEXT('long'),
  }
},{
  timestamps: true, // Enable timestamps
  createdAt: false, // Disable createdAt field
  updatedAt: true, // Enable updatedAt field
});

module.exports = Course;
