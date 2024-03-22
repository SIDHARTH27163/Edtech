// D:\edtech\edtech_backend\Models\User.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db'); // Import the Sequelize instance

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        defaultValue: '0'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    profile: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    details: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    verification: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rememberToken: {
        type: DataTypes.STRING,
        defaultValue: '0'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users', // Set the table name explicitly
    timestamps: false // Disable timestamps for createdAt and updatedAt
});

// Define associations if needed
User.associate = models => {
    User.hasMany(models.Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
};

module.exports = User;
