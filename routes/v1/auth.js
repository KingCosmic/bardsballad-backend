const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const snowflake = require('../../utils/snowflake');
const generateApiKey = require('../../utils/generateApiKey');
const convertToDays = require('../../utils/time/convertToDays');

const router = express.Router();

// Helper to generate JWTs
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      ...user,
      id: user.id.toString(),
      password: undefined,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );

  const apiKey = generateApiKey();

  return { accessToken, apiKey };
};

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password, deviceName } = req.body;

  if (!username || !email || !password || !deviceName) {
    return res.status(400).send('All fields are required');
  }

  const existingUser = await req.prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });
  
  if (existingUser) return res.status(400).send('User already exists, try logging in.');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await req.prisma.user.create({
    data: {
      id: snowflake.getUniqueID(),
      username,
      email,
      password: hashedPassword
    }
  });

  const { accessToken, apiKey } = generateTokens(user);

  const device = await req.prisma.device.create({
    data: {
      id: snowflake.getUniqueID(),
      name: deviceName,
      user_id: user.id,
      api_key: apiKey,
      token_expires: new Date(Date.now() + convertToDays(process.env.API_KEY_EXPIRES_IN)),
    }
  });

  res.status(200).json({ accessToken, apiKey, deviceId: device.id.toString() });
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password, deviceId, deviceName } = req.body;

  if (!username ||!password ||!deviceName) {
    return res.status(400).send('All fields are required');
  }

  const user = await req.prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) return res.status(401).send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('Invalid credentials');

  const { accessToken, apiKey } = generateTokens(user);

  let finalDeviceId = deviceId;
  if (!finalDeviceId) {
    const device = await req.prisma.device.create({
      data: {
        id: snowflake.getUniqueID(),
        name: deviceName,
        user_id: user.id,
        api_key: apiKey,
      }
    });

    finalDeviceId = device.id.toString();
  } else {
    const device = await req.prisma.device.findUnique({
      where: { id: finalDeviceId, user_id: user.id  }
    });

    if (!device) return res.status(401).send('Invalid device');
  }

  await req.prisma.device.update({
    where: { id: finalDeviceId, user_id: user.id },
    data: { api_key: apiKey }
  });

  res.status(200).json({ accessToken, apiKey, deviceId: finalDeviceId });
});

module.exports = router; 