import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth.service.js';
import type { JwtPayload } from '../types.js';

// Расширяем Request полем auth после успешной проверки токена
export interface AuthedRequest extends Request {
  auth?: JwtPayload;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  try {
    req.auth = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
