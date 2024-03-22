// config/sequelize.js

const { Sequelize } = require('sequelize');

// Initialize Sequelize with your database credentials
const sequelize = new Sequelize('edtech', 'root', '', {
  host: 'localhost', // Or your database host
  dialect: 'mysql', // Specify the database dialect (e.g., 'mysql', 'postgres', 'sqlite', 'mssql')
  logging: false, // Disable logging (you can enable it for debugging)
});

module.exports = sequelize;
