// session.model.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db'); // Import the Sequelize instance

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sessions', // Set the table name explicitly
    timestamps: false // Disable timestamps for createdAt and updatedAt
});

// Define associations if needed
Session.associate = models => {
    Session.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' }); // Assuming User model is defined
};

module.exports = Session;
