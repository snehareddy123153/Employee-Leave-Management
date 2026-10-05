import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'employeehub_secret_key_salesforce_mvp_2026';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const employee = await db.get(
      `SELECT e.*, d.name as departmentName 
       FROM employees e 
       JOIN departments d ON e.departmentId = d.id 
       WHERE e.email = ?`,
      [email]
    );

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const payload = {
      id: employee.id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      managerId: employee.managerId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: payload
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
