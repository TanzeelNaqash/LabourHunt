import jwt from 'jsonwebtoken';
import Worker from '../models/workerModel.js';

export default async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const worker = await Worker.findById(decoded.id);
    if (!worker) return res.status(401).json({ message: 'worker not found' });
    req.worker = worker;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
}