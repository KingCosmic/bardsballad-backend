const jwt = require('jsonwebtoken')

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject({ isValid: false, error: err.message });
      } else {
        resolve({ isValid: true, decoded });
      }
    });
  });
};

const isTokenExpiringSoon = (exp, thresholdInSeconds) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return exp - currentTime <= thresholdInSeconds;
};

// Middleware to authenticate JWT
const verifyRefreshToken = async (token) => {
  if (!token) return res.sendStatus(401);

  const { isValid, decoded } = await verifyJWT(token, process.env.JWT_REFRESH_SECRET);

  if (!isValid) return { isValid: false, error: 'Invalid refresh token' };

  let newToken = token;
  const threshold = 60 * 60 * 24 * 2; // 2 days

  if (isTokenExpiringSoon(decoded.exp, threshold)) {
    newToken = jwt.sign(
      {
        id: decoded.id,
        userID: decoded.userID
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Update the refresh token in the database
    await prisma.refreshToken.update({
      where: { id: decoded.id },
      data: { refreshToken: newToken }
    });
  }

  return { isValid: true, newToken: newToken, userID: decoded.id };
};

// Middleware to authenticate JWT
const verifyAccessToken = async (token, prisma, userID) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) return res.sendStatus(401);

  const { isValid, decoded } = await verifyJWT(token, process.env.JWT_ACCESS_SECRET);

  if (isValid) return { isValid: true, newToken: newToken, user: decoded };

  const user = await prisma.user.findUnique({
    where: { id: userID }
  });

  // Generate a new token with updated expiration
  const newToken = jwt.sign(
    {
      id: user.id, username: user.username, email: user.email, role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );

  return { isValid: true, newToken: newToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
};

// Middleware to authenticate JWT
const authenticateToken = async (req, res, next) => {
  const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  const refreshToken = req.headers['refresh'] && req.headers['refresh'].split(' ')[1];

  if (!accessToken || !refreshToken) return res.sendStatus(401);

  const { isValid: isRefreshValid, newToken: newRefreshToken, userID } = await verifyRefreshToken(refreshToken);
  if (!isRefreshValid) return res.sendStatus(401);

  const { isValid: isAccessValid, newToken: newAccessToken, user } = await verifyAccessToken(accessToken, req.prisma, userID);
  if (!isAccessValid) return res.sendStatus(401);

  res.setHeader('Authorization', `Bearer ${newAccessToken}`);
  res.setHeader('Refresh', `Bearer ${newRefreshToken}`);

  req.user = user;
  next();
};

module.exports = authenticateToken;