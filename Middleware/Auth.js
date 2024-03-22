const jwt = require('jsonwebtoken');
const { secretKey } = require('../db/config');

const auth = (req, res, next) => {
  const sessionToken = req.cookies.sessionToken;

  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token not provided' });
  }

  jwt.verify(sessionToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    req.userId = decoded.userId;
    next();
  });
};

module.exports = auth;
