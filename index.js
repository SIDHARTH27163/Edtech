
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./Middleware/errorHandler');
const dotenv = require('dotenv').config();
const { secretKey } = require('./db/config');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: secretKey, // Change this to a random secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 1 day (adjust as needed)
  }
}));
app.use(cors({
  origin: ['http://localhost:3000','http:// 192.168.180.143:1024','http:// 192.168.178.143:1024'], // Replace with your frontend URL
  credentials: true // Enable credentials (cookies, authorization headers)
}));

// Define your routes here
app.use("/api/auth", require("./routes/RegsiterRoutes"));
app.use("/api/domains", require("./routes/DomainRoutes"));
app.use("/api/courses", require("./routes/CoursesRoutes"));
app.use("/api/user", require("./routes/UserRoutes"));
app.use('/uploads', express.static('uploads'));


app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
