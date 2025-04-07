const express = require('express');
const router = express.Router();

const addPrisma = require('../middleware/addPrisma');

const v1Routes = require('./v1');

router.use('/v1', addPrisma, v1Routes);

// Define your routes here
router.get('/', (req, res) => {
  res.send('Hello, World! Currently using v1 routes');
});

module.exports = router; 