import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const generateToken = (id: number, role: string): string => {
  const secret = process.env.JWT_SECRET || 'kayal_secret';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      token,
      user: { id: user.id, _id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getMe = async (req: Request & { user?: { id: number | string } }, res: Response): Promise<void> => {
  try {
    const id = Number(req.user?.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user: { ...user, _id: user.id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
