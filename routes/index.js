const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');

router.use('/auth', authRoutes);

// Define your routes here
router.get('/', (req, res) => {
  res.send('Hello, World!');
});

module.exports = router; 