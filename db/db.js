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
        createDomainsTable();
        createcoursesTable();
        createuser_cartTable();
        course_materials();
        payments();
        createordersTable()
    }
});

function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            p_type VARCHAR(255) ,
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
function createDomainsTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status INT NOT NULL DEFAULT 0,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        heading LONGTEXT,
        description LONGTEXT,
        total_courses INT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating Domain table:', err);
        } else {
            console.log('Domain table created successfully');
        }
    });
}
function createcoursesTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status INT NOT NULL DEFAULT 0,
        d_id INT NOT NULL,
        u_id INT NOT NULL,
        c_name VARCHAR(255) NOT NULL,
        c_details TEXT,
        image VARCHAR(255) NOT NULL,
        timing_from TIME,
        timing_to TIME,
        start_date DATE,
        price DECIMAL(10, 2),
        c_duration VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      
      
    );
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating Courses table:', err);
        } else {
            console.log('Courses table created successfully');
        }
    });
}
function createuser_cartTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_cart (
        cart_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        
    );
    
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating Cart table:', err);
        } else {
            console.log('User Cart table created successfully');
        }
    });
}
function createordersTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS orders (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        
    );
    
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating orders table:', err);
        } else {
            console.log('User orders table created successfully');
        }
    });
}
function  course_materials() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS course_materials (
        material_id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT,
        material_name VARCHAR(255),
        material_type VARCHAR(50),
        material VARCHAR(255),
        description LONGTEXT,
        uploaded_by INT,
        upload_date DATE
    );
    
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating course_materials table:', err);
        } else {
            console.log('User course_materials table created successfully');
        }
    });
}
function  payments() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
        material_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        amount VARCHAR(255),
        material_type VARCHAR(50),
        status VARCHAR(255),
      
        payment_date DATE
    );
    
    
    `;
    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating payments table:', err);
        } else {
            console.log('User payments table created successfully');
        }
    });
}
module.exports = connection;
