import jwt from 'jsonwebtoken';

export interface JWTPayload {
  sub: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export class JWTUtils {
  static sign(payload: JWTPayload, secret: string, options?: jwt.SignOptions): string {
    return jwt.sign(payload, secret, {
      issuer: process.env.OIDC_ISSUER || 'https://naidp.example.com',
      expiresIn: '1h',
      ...options
    });
  }

  static verify(token: string, secret: string): JWTPayload {
    return jwt.verify(token, secret) as JWTPayload;
  }

  static decode(token: string): JWTPayload | null {
    const decoded = jwt.decode(token);
    return decoded as JWTPayload | null;
  }

  static generateKeyPair(): { privateKey: string; publicKey: string } {
    // In production, use proper key generation
    const crypto = require('crypto');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }
}