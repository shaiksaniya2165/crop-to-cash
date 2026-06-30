const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'croptocash_secret_2024';

exports.authUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

exports.authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Not admin' });
    req.admin = decoded;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};
