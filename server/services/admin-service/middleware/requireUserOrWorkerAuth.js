import jwt from 'jsonwebtoken';

export default function requireUserOrWorkerAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for required fields in JWT
    if (!decoded.role || !decoded.mobile) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    // Only allow client or worker roles
    if (decoded.role !== 'client' && decoded.role !== 'worker') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.role = decoded.role;      // 'client' or 'worker'
    req.mobile = decoded.mobile;  // user's mobile
    req.userId = decoded.id;      // user's id

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
} 