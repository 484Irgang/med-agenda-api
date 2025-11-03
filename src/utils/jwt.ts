import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/environment';
import { JwtPayload } from '../types/auth';

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: Number(env.JWT_EXPIRES_IN),
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
