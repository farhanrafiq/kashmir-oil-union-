import jwt from 'jsonwebtoken';
import config from '../config';
import { JWTPayload, UUID, UserRole } from '../types';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as object, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const createTokenPayload = (
  userId: UUID,
  role: UserRole,
  email: string,
  dealerId?: UUID,
): JWTPayload => {
  return {
    userId,
    role,
    email,
    dealerId,
  };
};
