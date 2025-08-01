import { Router, Request, Response } from 'express';
import { SqlUserRepository } from '@naidp/db';
import { User, AuthService } from '@naidp/domain';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../validation/schemas';

const router = Router();
const userRepository = new SqlUserRepository();
const authService = new AuthService(userRepository);

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const users = await userRepository.findAll(offset, Number(limit));
    const total = await userRepository.count();

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve users'
    });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);

    if (!user) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve user'
    });
  }
});

// Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const user = await authService.register(
      value.email,
      value.password,
      value.firstName,
      value.lastName
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create user'
    });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const user = await userRepository.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    // Update user properties
    if (value.firstName || value.lastName) {
      user.updateProfile(
        value.firstName || user.firstName,
        value.lastName || user.lastName
      );
    }
    
    if (value.isActive !== undefined) {
      value.isActive ? user.activate() : user.deactivate();
    }
    
    if (value.emailVerified !== undefined && value.emailVerified) {
      user.verifyEmail();
    }

    await userRepository.save(user);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    await userRepository.delete(id);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to delete user'
    });
  }
});

// Change user password
router.post('/:id/change-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    await authService.changePassword(id, value.currentPassword, value.newPassword);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid current password')) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid current password'
      });
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to change password'
    });
  }
});

export { router as usersRouter };