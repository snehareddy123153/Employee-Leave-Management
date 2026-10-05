import { getDb } from '../db/database.js';
import { WorkingDaysService } from './workingDays.service.js';

export class LeaveService {
  /**
   * Validates and submits a new leave request.
   */
  static async applyForLeave(
    employeeId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string
  ) {
    const db = await getDb();

    // 1. End date before start date validation
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('End date cannot be earlier than start date.');
    }

    // 2. Reason required
    if (!reason || reason.trim() === '') {
      throw new Error('A valid leave reason is required.');
    }

    // 3. Working day calculation
    const numberOfDays = WorkingDaysService.calculateWorkingDays(startDate, endDate);
    if (numberOfDays <= 0) {
      throw new Error('Selected date range contains 0 working days (weekends excluded).');
    }

    // 4. Fetch leave balance
    const currentYear = new Date(startDate).getFullYear();
    let balance = await db.get(
      `SELECT * FROM leave_balances WHERE employeeId = ? AND leaveType = ? AND year = ?`,
      [employeeId, leaveType, currentYear]
    );

    // If no balance exists for this year, automatically allocate default balance for testing
    if (!balance) {
      const defaultAllocation = leaveType === 'Paid Leave' ? 15 : (leaveType === 'Sick Leave' ? 12 : 10);
      const newBalId = `bal-${employeeId}-${leaveType.replace(/\s+/g, '')}-${currentYear}`;
      await db.run(
        `INSERT INTO leave_balances (id, employeeId, leaveType, allocatedDays, usedDays, remainingDays, year)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [newBalId, employeeId, leaveType, defaultAllocation, defaultAllocation, currentYear]
      );
      balance = await db.get(`SELECT * FROM leave_balances WHERE id = ?`, [newBalId]);
    }

    if (balance.remainingDays < numberOfDays) {
      throw new Error(
        `Insufficient leave balance for ${leaveType}. Available: ${balance.remainingDays} days, Requested: ${numberOfDays} days.`
      );
    }

    // 5. Fetch employee's manager
    const employee = await db.get(`SELECT managerId FROM employees WHERE id = ?`, [employeeId]);

    const requestId = `req-${Date.now()}`;
    await db.run(
      `INSERT INTO leave_requests (id, employeeId, leaveType, startDate, endDate, numberOfDays, reason, status, approverId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [requestId, employeeId, leaveType, startDate, endDate, numberOfDays, reason, 'Pending', employee?.managerId || null]
    );

    return { id: requestId, numberOfDays, status: 'Pending' };
  }

  /**
   * Approves a pending leave request and updates the employee's Leave Balance.
   */
  static async approveLeaveRequest(requestId: string, approverId: string, managerComments?: string) {
    const db = await getDb();

    const request = await db.get(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
    if (!request) {
      throw new Error('Leave request not found.');
    }

    if (request.status !== 'Pending') {
      throw new Error(`Cannot approve a leave request with status: ${request.status}.`);
    }

    // Invariant: User cannot approve their own leave request
    if (request.employeeId === approverId) {
      throw new Error('Conflict of interest: You cannot approve your own leave request.');
    }

    const year = new Date(request.startDate).getFullYear();

    // Begin database update
    await db.run('BEGIN TRANSACTION;');
    try {
      // 1. Update Request Status
      await db.run(
        `UPDATE leave_requests SET status = 'Approved', approverId = ?, managerComments = ? WHERE id = ?`,
        [approverId, managerComments || 'Approved by Manager', requestId]
      );

      // 2. Update Leave Balance (increase usedDays, recalculate remainingDays)
      const balance = await db.get(
        `SELECT * FROM leave_balances WHERE employeeId = ? AND leaveType = ? AND year = ?`,
        [request.employeeId, request.leaveType, year]
      );

      if (balance) {
        const newUsedDays = balance.usedDays + request.numberOfDays;
        const newRemainingDays = balance.allocatedDays - newUsedDays;

        if (newRemainingDays < 0) {
          throw new Error('Leave balance cannot become negative.');
        }

        await db.run(
          `UPDATE leave_balances SET usedDays = ?, remainingDays = ? WHERE id = ?`,
          [newUsedDays, newRemainingDays, balance.id]
        );
      }

      await db.run('COMMIT;');
      return { success: true, message: 'Leave request approved successfully.' };
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }

  /**
   * Rejects a pending leave request. Balance remains unchanged.
   */
  static async rejectLeaveRequest(requestId: string, approverId: string, managerComments?: string) {
    const db = await getDb();

    const request = await db.get(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
    if (!request) {
      throw new Error('Leave request not found.');
    }

    if (request.status !== 'Pending') {
      throw new Error(`Cannot reject a request with status: ${request.status}.`);
    }

    if (request.employeeId === approverId) {
      throw new Error('Conflict of interest: You cannot reject your own leave request.');
    }

    await db.run(
      `UPDATE leave_requests SET status = 'Rejected', approverId = ?, managerComments = ? WHERE id = ?`,
      [approverId, managerComments || 'Rejected', requestId]
    );

    return { success: true, message: 'Leave request rejected.' };
  }

  /**
   * Cancels an eligible pending leave request by the employee.
   */
  static async cancelLeaveRequest(requestId: string, employeeId: string) {
    const db = await getDb();

    const request = await db.get(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]);
    if (!request) {
      throw new Error('Leave request not found.');
    }

    if (request.employeeId !== employeeId) {
      throw new Error('Unauthorized to cancel this leave request.');
    }

    if (request.status !== 'Pending') {
      throw new Error('Only Pending leave requests can be cancelled.');
    }

    await db.run(`UPDATE leave_requests SET status = 'Cancelled' WHERE id = ?`, [requestId]);
    return { success: true, message: 'Leave request cancelled successfully.' };
  }
}
