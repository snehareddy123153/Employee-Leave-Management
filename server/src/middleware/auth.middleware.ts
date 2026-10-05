import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  departmentId: string;
  managerId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'employeehub_secret_key_salesforce_mvp_2026';

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Missing token.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    }
    req.user = decoded as AuthUser;
    next();
  });
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized access: Role '${req.user.role}' does not have permission to access this resource. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
