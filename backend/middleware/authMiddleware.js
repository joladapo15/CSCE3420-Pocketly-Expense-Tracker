const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
    return res.status(401).json({ error: 'Access denied. Token required.' });
  }

  const token = authHeader.split(/\s+/)[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    req.user = { user_id: decoded.user_id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
