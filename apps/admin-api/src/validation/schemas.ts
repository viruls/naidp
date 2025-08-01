import Joi from 'joi';
import { ClientType } from '@naidp/domain';

export const createClientSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  type: Joi.string().valid(...Object.values(ClientType)).required(),
  clientId: Joi.string().required().min(1).max(255),
  clientSecret: Joi.string().optional().min(8).max(255),
  redirectUris: Joi.array().items(Joi.string().uri()).required().min(1),
  allowedScopes: Joi.array().items(Joi.string()).required().min(1),
  metadata: Joi.object().optional()
});

export const updateClientSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  clientSecret: Joi.string().optional().min(8).max(255),
  redirectUris: Joi.array().items(Joi.string().uri()).optional().min(1),
  allowedScopes: Joi.array().items(Joi.string()).optional().min(1),
  metadata: Joi.object().optional(),
  isActive: Joi.boolean().optional()
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8).max(255),
  firstName: Joi.string().required().min(1).max(255),
  lastName: Joi.string().required().min(1).max(255)
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional().min(1).max(255),
  lastName: Joi.string().optional().min(1).max(255),
  isActive: Joi.boolean().optional(),
  emailVerified: Joi.boolean().optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8).max(255)
});