const express = require('express');
const connection = require('../db/db');
const { check, validationResult } = require('express-validator');
const app = express();
const { secretKey } = require('../db/config');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session=require('express-session')
app.use(cookieParser());
app.use(session())


function generateToken(length) {
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return token;
}
const getRegisters=(req, res)=>{
    res.status(200).json({
        message:"get all users from controller"
    })
};

let userEmail = ''; // Store the user's email temporarily
let generatedOTP = ''; // Store the generated OTP

// Function to send OTP via email and store the OTP
function sendOTP(email, callback) {
    generatedOTP = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'sidguleria0@gmail.com', // Replace with your email address
            pass: '' // Replace with your email password
        }
    });

    // Email content
    const mailOptions = {
        from: 'sidguleria0@gmail.com', // Replace with your email address
        to: email,
        subject: 'OTP for Registration',
        text: `Your OTP for registration is: ${generatedOTP}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            callback(error, null); // Pass error to callback
        } else {
            console.log('Email sent:', info.response);
            callback(null, generatedOTP); // Pass OTP to callback
        }
    });
}

const provideEmail = (req, res) => {
    const { email } = req.body;
    console.log(email);
    // Validate email
    if (!email || !isValidEmail(email)) {
        res.status(400).json({ error: "Please provide your valid email address" });
        return;
    }

    // Store the email temporarily
    userEmail = email;

    // Send OTP to the provided email
    sendOTP(email, (error, otp) => {
        if (error) {
            res.status(500).json({ error: "Failed to send OTP" });
            return;
        }
        res.status(200).json({ message: "OTP sent successfully" });
    });
};
const verifyOTP = (req, res, next) => {
    const { otp } = req.body;

    // Validate OTP
    if (!otp) {
        res.status(400).json({ error: "OTP is required" });
        return;
    }

    // Check if OTP matches the generated OTP
    if (otp !== generatedOTP) {
        res.status(400).json({ error: "Invalid OTP" });
        return;
    }

    // If OTP is valid, send a success message
    res.status(200).json({ message: "OTP verified successfully" });
    console.log("opt verified")
};



const completeRegistration = (req, res) => {
    const { name,  password , phoneNumber } = req.body;

if(!name||!password||!phoneNumber){
    res.status(400).json({ error: "Please Enter Details || All Feilds Are Required" });
    return;
}

 // Validate phone number
 if (!isValidPhoneNumber(phoneNumber)) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
}

// Validate password
if (!isValidPassword(password)) {
    res.status(400).json({ error: "Invalid password" });
    return;
}

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        // Check if email already exists
        connection.query(
            'SELECT COUNT(*) AS count FROM users WHERE email = ?',
            [userEmail],
            (err, results) => {
                if (err) {
                    console.error('Error querying database:', err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                }
                
                const count = results[0].count;
                if (count > 0) {
                    res.status(409).json({ error: "Email already exists" });
                    return;
                }

                // Insert data into MySQL database with hashed password
                connection.query(
                    'INSERT INTO users (email, name, phoneNumber, password, p_type) VALUES (?, ?, ?, ?, ?)',
                    [userEmail, name, phoneNumber, hashedPassword ,'Student'],
                    (err, results) => {
                        if (err) {
                            console.error('Error inserting data into MySQL:', err);
                            res.status(500).json({ error: "Internal Server Error" });
                            return;
                        }
                        res.status(201).json({
                            message: "Deatils Enter successfully || Now Login To The Application",
                            insertedId: results.insertId
                        });
                    }
                );
            }
        );
    });
};

// Route for completing registration, with OTP verification middleware


const complete_t_Registration = (req, res) => {
    const { name,  password , phoneNumber , email } = req.body;

if(!name||!password||!phoneNumber||!email ){
    res.status(400).json({ error: "Please Enter Details || All Feilds Are Required" });
    return;
}

 // Validate phone number
 if (!isValidPhoneNumber(phoneNumber)) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
}

// Validate password
if (!isValidPassword(password)) {
    res.status(400).json({ error: "Invalid password" });
    return;
}

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        // Check if email already exists
        connection.query(
            'SELECT COUNT(*) AS count FROM users WHERE email = ?',
            [email],
            (err, results) => {
                if (err) {
                    console.error('Error querying database:', err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                }
                
                const count = results[0].count;
                if (count > 0) {
                    res.status(409).json({ error: "Email already exists  || Chosse Different Email" });
                    return;
                }

                // Insert data into MySQL database with hashed password
                connection.query(
                    'INSERT INTO users (email, name, phoneNumber, password , p_type) VALUES (?, ?, ?, ?, ?)',
                    [email, name, phoneNumber, hashedPassword ,'Teacher'],
                    (err, results) => {
                        if (err) {
                            console.error('Error inserting data into MySQL:', err);
                            res.status(500).json({ error: "Internal Server Error" });
                            return;
                        }
                        res.status(201).json({
                            message: "Deatils Enter successfully || Now Login To The Application",
                            insertedId: results.insertId
                        });
                    }
                );
            }
        );
    });
};

 
   
const Login = async (req, res) => {
    const validationRules = [
        check('email')  .notEmpty().withMessage('Email field is required')
        .isEmail().withMessage('Please enter a valid email address'),
        check('password').notEmpty().withMessage('password feild isrequired || please enter password'),
       
        
      ];
  
      // Run validation and check for errors
      await Promise.all(validationRules.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const { email, password, remember } = req.body; // Extract 'remember' from request body
    if (req.session.userId) {
        return res.status(200).json({ success: true, message: "User is already logged in" });
    }

    // Query the database for user with the provided email
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error querying database: ' + err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Email or Password is incorrect || Check Your credentials" });
        }

        const user = results[0];
        // Compare password hash
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Passwords match, login successful
            let rememberToken = null; // Declare rememberToken variable
            if (remember) {
                // Generate a remember me token
                rememberToken = generateToken(32); // Assign rememberToken

                // Store the remember me token in the database
                const updateQuery = 'UPDATE users SET remember_token = ? WHERE id = ?';
                connection.query(updateQuery, [rememberToken, user.id], (err, result) => {
                    if (err) {
                        console.error('Error updating remember token: ' + err.message);
                    }
                });
                
                // Send the remember me token as a cookie to the user
                res.cookie('remember_me', rememberToken, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // Expires in 30 days
            }

            // Set user session
            req.session.userId = user.id;

            // Save session token to sessions table
            const sessionToken = req.sessionID;
            const insertQuery = 'INSERT INTO sessions (userId, token) VALUES (?, ?)';
            connection.query(insertQuery, [user.id, sessionToken], (err, result) => {
                if (err) {
                    console.error('Error inserting session token: ' + err.message);
                }
            });

            // Send login successful response with remember me token and session token
            return res.status(200).json({ success: true, message: "Login Successful", rememberToken: rememberToken, sessionToken: sessionToken });
        } else {
            // Passwords don't match
            return res.status(401).json({ success: false, error: "Email or Password is incorrect" });
        }
    });
};


const Validate_session = (req, res) => {
    const sessionId = req.headers['session-token'];

  if (!sessionId) {
    return res.status(401).json({ error: 'Session token is missing' });
  }
  connection.query('SELECT * FROM sessions WHERE token = ?', [sessionId], (err, results) => {
    if (err) {
      console.error('Error querying session database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    // Session is valid
    return res.status(200).json({ message: 'Session is valid' });
  });
}
const getProfile = (req, res) => {
   
      
  const user = req.user;
  const userId = user.id;

  res.json({
    user
  })
};

const updateRegister=(req, res)=>{
    res.status(201).json({
        message:`Put registeration routes  ${req.params.id}`
    })
};
const DeleteRegister=(req, res)=>{
    res.status(201).json({
        message:`Delete registeration routes  ${req.params.id}`
    })
};
const Logout = (req, res) => {
    const sessionToken = req.headers['session-token'];

    if (!sessionToken) {
        return res.status(401).json({ error: 'Session token is missing' });
    }

    // Delete session from the database
    const deleteSessionQuery = 'DELETE FROM sessions WHERE token = ?';
    connection.query(deleteSessionQuery, [sessionToken], (err, results) => {
        if (err) {
            console.error('Error deleting session from database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Clear remember me token cookie if any
        res.clearCookie('remember_me');

        return res.status(200).json({ message: 'Logout Successful' });
    });
};




// validation functions 

// Example email validation function
function isValidEmail(email) {
    // You can implement your email validation logic here
    // This is a simple regex-based validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Example phone number validation function
function isValidPhoneNumber(phoneNumber) {
    // You can implement your phone number validation logic here
    // This is a simple regex-based validation
    const phoneRegex = /^\d{10}$/; // Assuming phone number should be exactly 10 digits
    return phoneRegex.test(phoneNumber);
}

// Example password validation function
function isValidPassword(password) {
    // Check if password is at least 8 characters long and contains at least one uppercase letter and one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return passwordRegex.test(password);
}


// validation function ends
module.exports={
    Login,
    getRegisters,
    getProfile ,
    provideEmail, completeRegistration, complete_t_Registration,
      DeleteRegister , 
      updateRegister,
      verifyOTP,
      Logout,
      Validate_session
    };
