import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Not authorized, no token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'kayal_secret';
    const decoded = jwt.verify(token, secret) as { id: string; role: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
