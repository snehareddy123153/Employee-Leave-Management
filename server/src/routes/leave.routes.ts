import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { LeaveService } from '../services/leave.service.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET Leave Balances
router.get('/balances', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const targetEmpId = req.query.employeeId ? String(req.query.employeeId) : req.user?.id;
    const year = req.query.year ? parseInt(String(req.query.year)) : new Date().getFullYear();

    if (req.user?.role === 'EMPLOYEE' && targetEmpId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied: Employees can only view their own leave balances.' });
    }

    const balances = await db.all(
      `SELECT * FROM leave_balances WHERE employeeId = ? AND year = ?`,
      [targetEmpId, year]
    );

    res.json(balances);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Leave Requests
router.get('/requests', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === 'EMPLOYEE') {
      const requests = await db.all(
        `SELECT lr.*, e.fullName as employeeName, a.fullName as approverName
         FROM leave_requests lr
         JOIN employees e ON lr.employeeId = e.id
         LEFT JOIN employees a ON lr.approverId = a.id
         WHERE lr.employeeId = ?
         ORDER BY lr.createdAt DESC`,
        [userId]
      );
      return res.json(requests);
    }

    if (userRole === 'MANAGER') {
      // Pending requests for manager's direct reports or requests made by manager
      const requests = await db.all(
        `SELECT lr.*, e.fullName as employeeName, d.name as departmentName
         FROM leave_requests lr
         JOIN employees e ON lr.employeeId = e.id
         LEFT JOIN departments d ON e.departmentId = d.id
         WHERE e.managerId = ? OR lr.employeeId = ?
         ORDER BY lr.createdAt DESC`,
        [userId, userId]
      );
      return res.json(requests);
    }

    // HR Admin: Return all leave requests
    const requests = await db.all(
      `SELECT lr.*, e.fullName as employeeName, d.name as departmentName, a.fullName as approverName
       FROM leave_requests lr
       JOIN employees e ON lr.employeeId = e.id
       LEFT JOIN departments d ON e.departmentId = d.id
       LEFT JOIN employees a ON lr.approverId = a.id
       ORDER BY lr.createdAt DESC`
    );

    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Apply Leave
router.post('/apply', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user?.id!;

    const result = await LeaveService.applyForLeave(employeeId, leaveType, startDate, endDate, reason);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Approve Leave (Manager / HR)
router.patch('/requests/:id/approve', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ error: 'Access denied: Employees cannot approve leave requests.' });
    }

    const { id } = req.params;
    const { comments } = req.body;
    const approverId = req.user?.id!;

    const result = await LeaveService.approveLeaveRequest(id, approverId, comments);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Reject Leave (Manager / HR)
router.patch('/requests/:id/reject', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'EMPLOYEE') {
      return res.status(403).json({ error: 'Access denied: Employees cannot reject leave requests.' });
    }

    const { id } = req.params;
    const { comments } = req.body;
    const approverId = req.user?.id!;

    const result = await LeaveService.rejectLeaveRequest(id, approverId, comments);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Cancel Leave (Employee)
router.patch('/requests/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.id!;

    const result = await LeaveService.cancelLeaveRequest(id, employeeId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
