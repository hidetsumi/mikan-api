import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, password_hash: string): Promise<boolean> {
  return bcrypt.compare(password, password_hash);
}
