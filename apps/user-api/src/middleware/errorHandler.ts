import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // SAML errors
  if (err.message.includes('SAML')) {
    return res.status(400).json({
      error: 'SAML_ERROR',
      message: 'SAML authentication failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // OIDC errors
  if (err.message.includes('OIDC') || err.message.includes('oidc')) {
    return res.status(400).json({
      error: 'OIDC_ERROR',
      message: 'OIDC authentication failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // OAuth2 errors
  if (err.message.includes('OAuth') || err.message.includes('oauth')) {
    return res.status(400).json({
      error: 'OAUTH2_ERROR',
      message: 'OAuth2 authentication failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Validation errors
  if (err.message.includes('Invalid') || err.message.includes('required')) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message
    });
  }

  // Authentication errors
  if (err.message.includes('Unauthorized') || err.message.includes('Invalid credentials')) {
    return res.status(401).json({
      error: 'AUTHENTICATION_ERROR',
      message: 'Authentication failed'
    });
  }

  // Default error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};