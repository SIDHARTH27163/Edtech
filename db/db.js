const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'edtech'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database successfully');
        createUsersTable();
        createSessionTable(); // Call the function to create the session table
        createCoursesTable();
    }
});

function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            phoneNumber VARCHAR(20) DEFAULT 0,
            password VARCHAR(255) NOT NULL,
            status INT DEFAULT 0,
            profile INT DEFAULT 0,
            details INT DEFAULT 0,
            verfication INT DEFAULT 0,
            remember_token VARCHAR(300) DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created successfully');
        }
    });
}

function createSessionTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating session table:', err);
        } else {
            console.log('Session table created successfully');
        }
    });
}
function createCoursesTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status INT NOT NULL DEFAULT 0,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        heading LONGTEXT,
        description LONGTEXT,
        duration VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating course table:', err);
        } else {
            console.log('course table created successfully');
        }
    });
}

module.exports = connection;
