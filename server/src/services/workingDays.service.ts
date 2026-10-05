export class WorkingDaysService {
  /**
   * Calculates net working days between startDate and endDate, excluding Saturdays and Sundays.
   */
  static calculateWorkingDays(startDateStr: string, endDateStr: string): number {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }

    let workingDays = 0;
    const cur = new Date(start);

    while (cur <= end) {
      const day = cur.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return workingDays;
  }
}
