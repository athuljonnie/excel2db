const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // Create a token using the user's ID (or any other identifying information)
  return jwt.sign(
    { id: user._id, email: user.email }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '1h' } // Token expiration time
  );
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid Token.' });
    }
    req.user = decoded; // Attach user information to the request object
    next();
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
