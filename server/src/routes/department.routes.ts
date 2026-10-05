import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const depts = await db.all(
      `SELECT d.*, COUNT(e.id) as employeeCount 
       FROM departments d 
       LEFT JOIN employees e ON d.id = e.departmentId 
       GROUP BY d.id 
       ORDER BY d.name ASC`
    );
    res.json(depts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, requireRole('HR_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, departmentCode, location } = req.body;
    if (!name || !departmentCode) {
      return res.status(400).json({ error: 'Department Name and Code are required.' });
    }

    const db = await getDb();
    const id = `dept-${Date.now()}`;
    await db.run(
      `INSERT INTO departments (id, name, departmentCode, location) VALUES (?, ?, ?, ?)`,
      [id, name, departmentCode, location || '']
    );

    res.status(201).json({ id, name, departmentCode, location });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
