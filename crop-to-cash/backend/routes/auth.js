const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const SECRET = process.env.JWT_SECRET || 'croptocash_secret_2024';

// User Register
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, password, village, district, landType } = req.body;
    const exists = await User.findOne({ mobile });
    if (exists) return res.status(400).json({ message: 'Mobile already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, mobile, password: hash, village, district, landType });
    const token = jwt.sign({ id: user._id, name: user.name, role: 'user' }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, village, district, landType } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user._id, name: user.name, role: 'user' }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, village: user.village, district: user.district, landType: user.landType } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const admin = await Admin.findOne({ mobile });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: admin._id, name: admin.name, mobile: admin.mobile, role: 'admin' }, SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, mobile: admin.mobile } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Register
router.post('/admin/register', async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    const exists = await Admin.findOne({ mobile });
    if (exists) return res.status(400).json({ message: 'Mobile already registered' });
    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, mobile, password: hash });
    const token = jwt.sign({ id: admin._id, name: admin.name, mobile: admin.mobile, role: 'admin' }, SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, mobile: admin.mobile } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
