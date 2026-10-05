import { Router, Response } from 'express';
import { getDb } from '../db/database.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Only HR_ADMIN or MANAGER can access Reports
router.get('/attendance-summary', authenticateToken, requireRole('HR_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const employees = await db.all('FROM employees');
    const departments = await db.all('FROM departments');
    const attendances = await db.all('FROM attendances');

    const rows = employees.map(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const empAtt = attendances.filter(a => a.employeeId === emp.id);
      const present = empAtt.filter(a => a.status === 'Present').length;
      const late = empAtt.filter(a => a.status === 'Late').length;
      const absent = empAtt.filter(a => a.status === 'Absent').length;
      const totalDays = empAtt.length;
      const attendancePercentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;

      return {
        Employee: emp.fullName,
        Department: dept ? dept.name : 'Engineering',
        Present: present,
        Late: late,
        Absent: absent,
        TotalDays: totalDays,
        AttendancePercentage: attendancePercentage
      };
    });

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leave-summary', authenticateToken, requireRole('HR_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const currentYear = new Date().getFullYear();

    const employees = await db.all('FROM employees');
    const departments = await db.all('FROM departments');
    const balances = await db.all('FROM leave_balances', [null, currentYear]);

    const report = employees.map(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const empBalances = balances.filter(b => b.employeeId === emp.id);
      
      const casual = empBalances.find(b => b.leaveType === 'Casual Leave') || { allocatedDays: 12, usedDays: 0, remainingDays: 12 };
      const sick = empBalances.find(b => b.leaveType === 'Sick Leave') || { allocatedDays: 10, usedDays: 0, remainingDays: 10 };
      const earned = empBalances.find(b => b.leaveType === 'Earned Leave' || b.leaveType === 'Paid Leave') || { allocatedDays: 15, usedDays: 0, remainingDays: 15 };

      return {
        Employee: emp.fullName,
        Department: dept ? dept.name : 'Engineering',
        casualAllocated: casual.allocatedDays,
        casualUsed: casual.usedDays,
        casualRemaining: casual.remainingDays,
        sickAllocated: sick.allocatedDays,
        sickUsed: sick.usedDays,
        sickRemaining: sick.remainingDays,
        earnedAllocated: earned.allocatedDays,
        earnedUsed: earned.usedDays,
        earnedRemaining: earned.remainingDays
      };
    });

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leave-requests', authenticateToken, requireRole('HR_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const employees = await db.all('FROM employees');
    const requests = await db.all('FROM leave_requests');

    const rows = requests.map(lr => {
      const emp = employees.find(e => e.id === lr.employeeId);
      return {
        Employee: emp ? emp.fullName : 'Employee',
        LeaveType: lr.leaveType,
        StartDate: lr.startDate,
        EndDate: lr.endDate,
        Days: lr.numberOfDays,
        Status: lr.status || 'Pending',
        Reason: lr.reason || ''
      };
    });

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/department-attendance', authenticateToken, requireRole('HR_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const departments = await db.all('FROM departments');
    const employees = await db.all('FROM employees');
    const attendances = await db.all('FROM attendances');

    const rows = departments.map(d => {
      const deptEmployees = employees.filter(e => e.departmentId === d.id);
      const empIds = deptEmployees.map(e => e.id);
      const deptAttendances = attendances.filter(a => empIds.includes(a.employeeId));

      const present = deptAttendances.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const absent = deptAttendances.filter(a => a.status === 'Absent').length;
      const total = deptAttendances.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      return {
        Department: d.name,
        Employees: deptEmployees.length,
        Present: present,
        Absent: absent,
        AttendancePercentage: percentage
      };
    });

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
