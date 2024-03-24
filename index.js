
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
app.use(cors());

// Define your routes here
app.use("/api/register", require("./routes/RegsiterRoutes"));
app.use("/api/courses", require("./routes/CourseRoutes"));

app.use('/uploads', express.static('uploads'));


app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
