const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Import the Sequelize instance
const Domains = require('./Domain'); // Import the Domains model
 // Import the Users model
const CourseMaterial = sequelize.define('CourseMaterial', {
    material_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'course_id'
        }
    },
    material_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    material_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    material: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    upload_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'course_materials',
    timestamps: false // Assuming you don't need timestamps in this table
});


module.exports = CourseMaterial;
