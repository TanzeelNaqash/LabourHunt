import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';

export default async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if admin
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(401).json({ message: 'admin not found' });
      req.admin = admin;
      return next();
    }
    // Check if user (client)
    if (decoded.role === 'client') {
      req.user = decoded; // { id, username, role, photo }
      req.user._id = decoded.id; // Ensure _id is set for consistency
      return next();
    }
    return res.status(401).json({ message: 'Invalid role' });
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
}