const express = require('express');
const connection = require('../db/db');
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
            pass: 'pbkh uiqm npho celt' // Replace with your email password
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
                    'INSERT INTO users (email, name, phoneNumber, password) VALUES (?, ?, ?, ?)',
                    [userEmail, name, phoneNumber, hashedPassword],
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


 
   
const Login = (req, res) => {
    const { email, password, remember } = req.body; // Extract 'remember' from request body

    if (!password || !email) {
        return res.status(400).json({ error: "Please Enter Email And Password || All Fields Are Required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid Email Format" });
    }

    // Validate password format
    if (!isValidPassword(password)) {
        return res.status(400).json({ error: "Invalid password format" });
    }

    // Check if user is already logged in
    if (req.session.userId) {
        return res.status(400).json({ success: false, error: "User is already logged in" });
    }

    // Query the database for user with the provided email
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error querying database: ' + err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Email or Password is incorrect" });
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
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
   
    // Fetch user profile from database based on session data
    const userId = req.session.userId;
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error querying database: ' + err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userProfile = results[0];
        // Remove sensitive data like password before sending response
        delete userProfile.password;
        return res.status(200).json({ profile: userProfile, session:req.sessionID });
    });
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
    const sessionId = req.headers['session-token'];

    if (!sessionId) {
        return res.status(401).json({ error: 'Session token is missing' });
    }

    connection.query('DELETE FROM sessions WHERE token = ?', [sessionId], (err, results) => {
        if (err) {
            console.error('Error deleting session from database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session: ' + err.message);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            // Clear remember me token cookie
            res.clearCookie('remember_me');

            return res.status(200).json({ message: "Logout Successful" });
        });
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
    provideEmail, completeRegistration,
      DeleteRegister , 
      updateRegister,
      verifyOTP,
      Logout,
      Validate_session
    };