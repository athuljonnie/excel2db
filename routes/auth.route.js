const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/auth');

const router = express.Router();

// In-memory "database" for demonstration (use a real DB in production)
const users = [];

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password and save user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword, _id: users.length + 1 };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate JWT
  const token = generateToken(user);

  res.json({ token });
});

// Protected Route
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
