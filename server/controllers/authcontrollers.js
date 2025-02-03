const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup Route
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({ username, email, hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Route

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Validation
        if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
        }
    
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        // Create token
        const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
        expiresIn: '1h',
        });
    
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
    };

module.exports = exports;