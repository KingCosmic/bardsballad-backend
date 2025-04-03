const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));

router.use('/characters', require('./characters'))

module.exports = router; 