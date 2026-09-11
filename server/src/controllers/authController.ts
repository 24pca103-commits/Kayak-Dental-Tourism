import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const generateToken = (id: string | number, role: string): string => {
  const secret = process.env.JWT_SECRET || 'kayal_secret';
  return jwt.sign({ id: String(id), role }, secret, { expiresIn: '7d' });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if user exists in MySQL
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-seed default admin if database is empty
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@kayaldental.com').toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
    const defaultAdminName = process.env.ADMIN_NAME || 'Admin';

    if (!user && cleanEmail === defaultAdminEmail && password === defaultAdminPassword) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      user = await prisma.user.create({
        data: {
          name: defaultAdminName,
          email: defaultAdminEmail,
          password: hashedPassword,
          role: 'admin',
        },
      });
      console.log(`👤 Auto-created default admin in MySQL: ${defaultAdminEmail}`);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Compare password with bcrypt or plaintext fallback
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch && user.password !== password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.user?.id || '0');
    if (!id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user: { ...user, _id: String(user.id) } });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
