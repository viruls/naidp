import { Router, Request, Response } from 'express';
import { AuthService } from '@naidp/domain';
import { SqlUserRepository } from '@naidp/db';
import { JWTUtils } from '@naidp/protocols';

const router = Router();
const userRepository = new SqlUserRepository();
const authService = new AuthService(userRepository);

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required'
      });
    }

    const user = await authService.authenticate(email, password);

    if (!user) {
      return res.status(401).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = JWTUtils.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.fullName
      },
      process.env.JWT_SECRET || 'default-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailVerified: user.emailVerified
      },
      token,
      expires_in: 24 * 60 * 60 // 24 hours in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Login failed'
    });
  }
});

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    const user = await authService.register(email, password, firstName, lastName);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailVerified: user.emailVerified
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'CONFLICT_ERROR',
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Registration failed'
    });
  }
});

// Token verification endpoint
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Token is required'
      });
    }

    const payload = JWTUtils.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'AUTHENTICATION_ERROR',
      message: 'Invalid token'
    });
  }
});

export { router as authRouter };