import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { AttendanceService } from '../services/attendance.service.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET Today's Attendance status for current user
router.get('/today', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user?.id;

    const record = await db.get(
      `SELECT * FROM attendances WHERE employeeId = ? AND date = ?`,
      [userId, today]
    );

    res.json(record || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Attendance records (Filtered by role)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === 'EMPLOYEE') {
      const records = await db.all(
        `SELECT a.*, e.fullName as employeeName 
         FROM attendances a
         JOIN employees e ON a.employeeId = e.id
         WHERE a.employeeId = ?
         ORDER BY a.date DESC LIMIT 30`,
        [userId]
      );
      return res.json(records);
    }

    if (userRole === 'MANAGER') {
      const records = await db.all(
        `SELECT a.*, e.fullName as employeeName, d.name as departmentName
         FROM attendances a
         JOIN employees e ON a.employeeId = e.id
         LEFT JOIN departments d ON e.departmentId = d.id
         WHERE e.managerId = ? OR a.employeeId = ?
         ORDER BY a.date DESC LIMIT 50`,
        [userId, userId]
      );
      return res.json(records);
    }

    // HR Admin
    const records = await db.all(
      `SELECT a.*, e.fullName as employeeName, d.name as departmentName
       FROM attendances a
       JOIN employees e ON a.employeeId = e.id
       LEFT JOIN departments d ON e.departmentId = d.id
       ORDER BY a.date DESC LIMIT 100`
    );

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Check-In
router.post('/check-in', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { remarks } = req.body;
    const userId = req.user?.id!;

    const result = await AttendanceService.checkIn(userId, remarks);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST Check-Out
router.post('/check-out', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const result = await AttendanceService.checkOut(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
