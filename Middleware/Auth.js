const connection = require('../db/db');
const isAuthenticated = (req, res, next) => {
  const sessionToken = req.headers['session-token'] || req.cookies['session-token'];

  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized - Session token is missing' });
  }

  // Query the database to get user details based on the session token
  const query = 'SELECT * FROM sessions WHERE token = ?';
  connection.query(query, [sessionToken], (err, results) => {
    if (err) {
      console.error('Error querying session database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Please Login Again Your Session Ends' });
    }

    const sessionData = results[0];
    // Fetch user details from the database based on userId in sessionData
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    connection.query(userQuery, [sessionData.userId], (err, userResults) => {
      if (err) {
        console.error('Error querying user database:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (userResults.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = userResults[0];
      // Attach user details to the request object for further use
      req.user = user;
      next(); // Move to the next middleware or route handler
    });
  });
};

module.exports = isAuthenticated;
