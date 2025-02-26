const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log(req.body);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });
  
  if (existingUser) return res.status(400).send('User already exists, try logging in.');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  let token;
  try {
    token = jwt.sign({ username: user.username, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
  } catch (error) {
    return res.status(500).send(new Error('Error! Something went wrong.'));
  }

  res.status(201).json({ token });
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) return res.status(400).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) return res.status(400).send('Invalid credentials');

  let token;
  try {
    token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
  } catch (error) {
    return res.status(500).send(new Error('Error! Something went wrong.'));
  }

  res.status(200).json({ token });
});

module.exports = router; 