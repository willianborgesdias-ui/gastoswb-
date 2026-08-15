import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    isCustom?: boolean;
    userId?: number;
  };
}

// In-memory store for active custom sessions (token -> { uid, email, userId })
export const activeSessions = new Map<string, { uid: string; email: string; userId: number }>();

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Check if it's a custom session token
  if (activeSessions.has(token)) {
    const session = activeSessions.get(token)!;
    req.user = {
      uid: session.uid,
      email: session.email,
      userId: session.userId,
      isCustom: true
    };
    return next();
  }

  // 2. Fallback to Firebase verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      isCustom: false
    };
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
