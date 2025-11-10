import bcrypt from 'bcrypt';
import config from '../config';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-8);
};
