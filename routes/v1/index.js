const express = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const router = express.Router();

router.use('/auth', require('./auth'));

router.use('/characters', require('./characters'))

router.use('/test', authenticateToken, async (req, res) => {
  console.log(req.user);

  console.log(await req.prisma.character.findMany({}))

  res.send(`Test Successful ${req.user.username}`);
})

router.use('/ping', (req, res) => {
  res.send('Pong!');
})

module.exports = router; 