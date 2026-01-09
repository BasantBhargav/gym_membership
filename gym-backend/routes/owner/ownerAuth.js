const express = require('express');
const router = express.Router();
const Owner = require('../../models/Owner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Owner
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, gymName, gymAddress } = req.body;

    // Check if owner already exists
    let owner = await Owner.findOne({ email });
    if (owner) {
      return res.status(400).json({ message: 'Owner already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new owner
    owner = new Owner({
      name,
      email,
      password: hashedPassword,
      phone,
      gymName,
      gymAddress,
    });

    await owner.save();

    // Create JWT token
    const payload = { id: owner._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Owner registered successfully',
      token,
      owner: { id: owner._id, email: owner.email, gymName: owner.gymName },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Owner
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if owner exists
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = { id: owner._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      owner: { id: owner._id, email: owner.email, gymName: owner.gymName },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
