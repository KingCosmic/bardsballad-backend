const jwt = require('jsonwebtoken');

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        resolve({ isValid: false, error: err.message });
      } else {
        resolve({ isValid: true, decoded });
      }
    });
  });
};

const authenticateToken = async (req, res, next) => {
  const prisma = req.prisma;
  const accessToken = req.headers['authorization']?.split(' ')[1];
  const refreshToken = req.headers['refresh']?.split(' ')[1];
  const deviceID = req.headers['device-id'];

  if (!accessToken || !refreshToken || !deviceID) {
    return res.status(401).json({ error: 'Missing tokens or device ID' });
  }

  // Verify Access Token First
  const { isValid, decoded } = await verifyJWT(accessToken, process.env.JWT_ACCESS_SECRET);
  if (isValid) {
    req.user = decoded;
    return next();
  }

  // Verify the Refresh Token Before Querying Database
  const { isValid: isRefreshValid, decoded: refreshDecoded } = await verifyJWT(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (!isRefreshValid) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  // Lookup the Refresh Token in the Database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken, deviceID },
  });

  if (!storedToken) {
    return res.status(403).json({ error: 'Refresh token not found' });
  }

  // Generate a New Access Token
  const newAccessToken = jwt.sign(
    {
      id: user.id, username: user.username, email: user.email, role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );

  let newRefreshToken = refreshToken;
  let refreshTokenExpiresAt = storedToken.expiresAt;

  // Rotate Refresh Token If Close to Expiring
  const remainingTime = storedToken.expiresAt - Date.now();
  const refreshThreshold = process.env.REFRESH_TOKEN_RENEW_THRESHOLD * 1000;

  if (remainingTime < refreshThreshold) {
    newRefreshToken = jwt.sign(
      { id: storedToken.userId, deviceID },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    refreshTokenExpiresAt = Date.now() + process.env.JWT_REFRESH_EXPIRES_IN * 1000;

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { token: newRefreshToken, expiresAt: refreshTokenExpiresAt },
    });
  }

  // Set New Tokens in Headers
  res.setHeader('Authorization', `Bearer ${newAccessToken}`);
  res.setHeader('Refresh', `Bearer ${newRefreshToken}`);

  // Attach User ID to Request and Proceed
  req.user = { id: storedToken.userId };
  next();
};

module.exports = authenticateToken;
