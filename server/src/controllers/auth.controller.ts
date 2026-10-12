import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import { RegisterUserSchema, LoginUserSchema } from '../validators/investigation.validator.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// In-memory fallback if MongoDB connection is pending or offline
const memoryUsers = new Map<string, any>();

export async function register(req: Request, res: Response) {
  try {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { email, password, name } = parseResult.data;
    const lowerEmail = email.toLowerCase();

    // Check if MongoDB is connected
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const existing = await User.findOne({ email: lowerEmail });
        if (existing) {
          return res.status(409).json({ error: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
          email: lowerEmail,
          passwordHash,
          name,
          role: 'investigator'
        });

        const token = jwt.sign(
          { id: user._id.toString(), email: user.email, role: user.role },
          config.jwtSecret,
          { expiresIn: '7d' }
        );

        return res.status(201).json({
          message: 'Account created successfully.',
          token,
          user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
      } catch {
        // Fallback to memory below if DB throws
      }
    }

    // Memory fallback when MongoDB is offline
    if (memoryUsers.has(lowerEmail)) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = 'mem_user_' + Date.now();
    const user = { id, email: lowerEmail, passwordHash, name, role: 'investigator' };
    memoryUsers.set(lowerEmail, user);

    const token = jwt.sign(
      { id, email: lowerEmail, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully (Memory storage mode).',
      token,
      user: { id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parseResult = LoginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { email, password } = parseResult.data;
    const lowerEmail = email.toLowerCase();

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const user = await User.findOne({ email: lowerEmail });
        if (user) {
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
          }
          const token = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
          );
          return res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
          });
        }
      } catch {
        // Fall through to memory fallback check
      }
    }

    const memUser = memoryUsers.get(lowerEmail);
    if (memUser) {
      const isMatch = await bcrypt.compare(password, memUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = jwt.sign(
        { id: memUser.id, email: memUser.email, role: memUser.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: { id: memUser.id, email: memUser.email, name: memUser.name, role: memUser.role }
      });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
}

export async function loginDemo(req: Request, res: Response) {
  const demoId = 'demo_investigator_' + Date.now();
  const token = jwt.sign(
    { id: demoId, email: 'investigator.demo@chainforensics.io', role: 'demo_user' },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
  return res.json({
    token,
    user: {
      id: demoId,
      email: 'investigator.demo@chainforensics.io',
      name: 'Guest Investigator (Demo Session)',
      role: 'demo_user'
    }
  });
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated.' });
  }
  return res.json({ user: req.user });
}
