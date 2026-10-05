import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET all employees (HR only or Manager viewing direct reports)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === 'EMPLOYEE') {
      return res.status(403).json({ error: 'Access denied. Employees cannot view org employee list.' });
    }

    if (userRole === 'MANAGER') {
      // Return direct reports for manager
      const team = await db.all(
        `SELECT e.id, e.employeeId, e.fullName, e.email, e.phone, e.joiningDate, e.employmentStatus, e.role, d.name as departmentName
         FROM employees e
         LEFT JOIN departments d ON e.departmentId = d.id
         WHERE e.managerId = ? OR e.id = ?`,
        [userId, userId]
      );
      return res.json(team);
    }

    // HR Admin: Return all employees
    const employees = await db.all(
      `SELECT e.id, e.employeeId, e.fullName, e.email, e.phone, e.joiningDate, e.employmentStatus, e.role, 
              d.name as departmentName, m.fullName as managerName
       FROM employees e
       LEFT JOIN departments d ON e.departmentId = d.id
       LEFT JOIN employees m ON e.managerId = m.id
       ORDER BY e.employeeId ASC`
    );

    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create new employee (HR Admin only)
router.post('/', authenticateToken, requireRole('HR_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const { fullName, email, password, phone, departmentId, managerId, joiningDate, role } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    // Check email uniqueness
    const existing = await db.get(`SELECT id FROM employees WHERE email = ?`, [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: `An employee with email '${email}' already exists.` });
    }

    const allEmps = await db.all('FROM employees');
    const empCount = 1001 + allEmps.length;
    const newId = `emp-${Date.now()}`;
    const empCode = `EMP-${empCount}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const joinDate = joiningDate || new Date().toISOString().split('T')[0];
    const userRole = role || 'EMPLOYEE';
    const deptId = departmentId || 'dept-101'; // Default to Engineering

    await db.run(
      `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, empCode, fullName.trim(), email.trim(), passwordHash, phone || '', deptId, managerId || null, joinDate, 'Active', userRole]
    );

    // Auto-allocate annual leave balances for current year
    const currentYear = new Date().getFullYear();
    const defaultTypes = [
      { type: 'Casual Leave', days: 12 },
      { type: 'Sick Leave', days: 10 },
      { type: 'Earned Leave', days: 15 }
    ];

    for (const item of defaultTypes) {
      const balId = `bal-${newId}-${item.type.replace(/\s+/g, '')}-${currentYear}`;
      await db.run(
        `INSERT INTO leave_balances (id, employeeId, leaveType, allocatedDays, usedDays, remainingDays, year)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [balId, newId, item.type, item.days, item.days, currentYear]
      );
    }

    res.status(201).json({
      message: 'Employee created successfully.',
      employee: {
        id: newId,
        employeeId: empCode,
        fullName,
        email,
        role: userRole,
        departmentId: deptId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single employee profile
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    // Enforce authorization
    if (req.user?.role === 'EMPLOYEE' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
    }

    const employee = await db.get(
      `SELECT e.id, e.employeeId, e.fullName, e.email, e.phone, e.joiningDate, e.employmentStatus, e.role,
              d.name as departmentName, m.fullName as managerName
       FROM employees e
       LEFT JOIN departments d ON e.departmentId = d.id
       LEFT JOIN employees m ON e.managerId = m.id
       WHERE e.id = ?`,
      [id]
    );

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(employee);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
