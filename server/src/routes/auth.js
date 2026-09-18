import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password, name } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Also create a default "Welcome Project" with a sample "index.js"
    const defaultProject = await prisma.project.create({
      data: {
        name: 'My First Project',
        description: 'Getting started with Code Master',
        userId: user.id,
        files: {
          create: [
            {
              name: 'index.js',
              content: `// Welcome to Code Master!\nconsole.log("Hello, world!");\n\nconst fibonacci = (n) => {\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return n === 0 ? a : b;\n};\n\nconsole.log("Fibonacci(10):", fibonacci(10));\n`,
              language: 'javascript',
            },
            {
              name: 'package.json',
              content: `{\n  "name": "my-first-project",\n  "version": "1.0.0",\n  "description": "Sample project in Code Master"\n}\n`,
              language: 'json',
            },
          ],
        },
      },
    });

    const token = generateToken(user.id);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
      defaultProjectId: defaultProject.id,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
