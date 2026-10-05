import { getDb } from '../db/database.js';

export class AttendanceService {
  /**
   * Performs Check-In for today's attendance record.
   */
  static async checkIn(employeeId: string, remarks?: string) {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];

    // 1. Invariant: Prevent duplicate check-in for the same date
    const existing = await db.get(
      `SELECT * FROM attendances WHERE employeeId = ? AND date = ?`,
      [employeeId, today]
    );

    if (existing) {
      throw new Error('Duplicate check-in! You have already recorded attendance for today.');
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Check-in after 9:30 AM -> Late, otherwise Present
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);
    const status = isLate ? 'Late' : 'Present';

    const attId = `att-${Date.now()}`;
    await db.run(
      `INSERT INTO attendances (id, employeeId, date, checkIn, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [attId, employeeId, today, nowIso, status, remarks || null]
    );

    return { id: attId, date: today, checkIn: nowIso, status };
  }

  /**
   * Performs Check-Out for today's attendance record.
   */
  static async checkOut(employeeId: string) {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];

    const att = await db.get(
      `SELECT * FROM attendances WHERE employeeId = ? AND date = ?`,
      [employeeId, today]
    );

    if (!att || !att.checkIn) {
      throw new Error('No check-in record found for today. You must check in first before checking out.');
    }

    if (att.checkOut) {
      throw new Error('You have already checked out for today.');
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const checkInTime = new Date(att.checkIn);

    if (now < checkInTime) {
      throw new Error('Check-out timestamp cannot be earlier than check-in timestamp.');
    }

    // Calculate working hours
    const diffMs = now.getTime() - checkInTime.getTime();
    const workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    await db.run(
      `UPDATE attendances SET checkOut = ?, workingHours = ? WHERE id = ?`,
      [nowIso, workingHours, att.id]
    );

    return { id: att.id, date: today, checkOut: nowIso, workingHours };
  }
}
