const express = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const router = express.Router();

router.use('/auth', require('./auth'));

router.use('/characters', require('./characters'))

router.use('/test', authenticateToken, (req, res) => {
  res.send(`Test Successful ${req.user.username}`);
})

module.exports = router; 