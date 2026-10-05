import fs from 'fs';
import path from 'path';

export interface DbSchema {
  departments: any[];
  employees: any[];
  leave_balances: any[];
  leave_requests: any[];
  attendances: any[];
}

const dbPath = path.resolve(__dirname, '../../database.json');

class LocalDatabase {
  private data: DbSchema = {
    departments: [],
    employees: [],
    leave_balances: [],
    leave_requests: [],
    attendances: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      this.data = { departments: [], employees: [], leave_balances: [], leave_requests: [], attendances: [] };
    }
  }

  public save() {
    fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public async exec(sql: string) {
    if (sql.includes('DELETE FROM')) {
      if (sql.includes('attendances')) this.data.attendances = [];
      if (sql.includes('leave_requests')) this.data.leave_requests = [];
      if (sql.includes('leave_balances')) this.data.leave_balances = [];
      if (sql.includes('employees')) this.data.employees = [];
      if (sql.includes('departments')) this.data.departments = [];
      this.save();
    }
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    if (cleanSql.startsWith('BEGIN') || cleanSql.startsWith('COMMIT') || cleanSql.startsWith('ROLLBACK')) {
      return;
    }

    if (cleanSql.startsWith('INSERT INTO departments')) {
      this.data.departments.push({
        id: params[0],
        name: params[1],
        departmentCode: params[2],
        location: params[3],
        createdAt: new Date().toISOString()
      });
    } else if (cleanSql.startsWith('INSERT INTO employees')) {
      this.data.employees.push({
        id: params[0],
        employeeId: params[1],
        fullName: params[2],
        email: params[3],
        passwordHash: params[4],
        phone: params[5],
        departmentId: params[6],
        managerId: params[7],
        joiningDate: params[8],
        employmentStatus: params[9],
        role: params[10],
        createdAt: new Date().toISOString()
      });
    } else if (cleanSql.startsWith('INSERT INTO leave_balances')) {
      this.data.leave_balances.push({
        id: params[0],
        employeeId: params[1],
        leaveType: params[2],
        allocatedDays: params[3],
        usedDays: params[4],
        remainingDays: params[5],
        year: params[6],
        createdAt: new Date().toISOString()
      });
    } else if (cleanSql.startsWith('INSERT INTO leave_requests')) {
      this.data.leave_requests.push({
        id: params[0],
        employeeId: params[1],
        leaveType: params[2],
        startDate: params[3],
        endDate: params[4],
        numberOfDays: params[5],
        reason: params[6],
        status: params[7] || 'Pending',
        approverId: params[8] || null,
        managerComments: params[9] || null,
        createdAt: new Date().toISOString()
      });
    } else if (cleanSql.startsWith('INSERT INTO attendances')) {
      this.data.attendances.push({
        id: params[0],
        employeeId: params[1],
        date: params[2],
        checkIn: params[3],
        checkOut: params[4] || null,
        status: params[5] || 'Present',
        workingHours: params[6] || 0,
        remarks: params[7] || null,
        createdAt: new Date().toISOString()
      });
    } else if (cleanSql.includes('UPDATE leave_requests SET status =')) {
      const statusMatch = cleanSql.match(/status = '([^']+)'/);
      const newStatus = statusMatch ? statusMatch[1] : params[0];
      let approverId = params[0];
      let comments = params[1];
      let id = params[2];

      if (cleanSql.includes('UPDATE leave_requests SET status = \'Cancelled\'')) {
        id = params[0];
        const req = this.data.leave_requests.find(r => r.id === id);
        if (req) req.status = 'Cancelled';
      } else {
        const req = this.data.leave_requests.find(r => r.id === id);
        if (req) {
          req.status = newStatus;
          req.approverId = approverId;
          req.managerComments = comments;
        }
      }
    } else if (cleanSql.includes('UPDATE leave_balances SET usedDays =')) {
      const [usedDays, remainingDays, id] = params;
      const lb = this.data.leave_balances.find(b => b.id === id);
      if (lb) {
        lb.usedDays = usedDays;
        lb.remainingDays = remainingDays;
      }
    } else if (cleanSql.includes('UPDATE attendances SET checkOut =')) {
      const [checkOut, workingHours, id] = params;
      const att = this.data.attendances.find(a => a.id === id);
      if (att) {
        att.checkOut = checkOut;
        att.workingHours = workingHours;
      }
    }

    this.save();
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    const list = await this.all(sql, params);
    return list.length > 0 ? list[0] : null;
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    if (cleanSql.includes('FROM employees')) {
      if (cleanSql.includes('WHERE email =') || cleanSql.includes('WHERE e.email =')) {
        const email = params[0];
        const emp = this.data.employees.find(e => e.email === email);
        if (!emp) return [];
        const dept = this.data.departments.find(d => d.id === emp.departmentId);
        return [{ ...emp, departmentName: dept ? dept.name : 'Engineering' }];
      }

      if (cleanSql.includes('WHERE id =') || cleanSql.includes('WHERE e.id =')) {
        const id = params[0];
        const emp = this.data.employees.find(e => e.id === id);
        if (!emp) return [];
        const dept = this.data.departments.find(d => d.id === emp.departmentId);
        const mgr = this.data.employees.find(m => m.id === emp.managerId);
        return [{ ...emp, departmentName: dept ? dept.name : 'Engineering', managerName: mgr ? mgr.fullName : null }];
      }

      const isManagerQuery = cleanSql.includes('WHERE managerId =') || cleanSql.includes('WHERE e.managerId =');
      const managerId = isManagerQuery ? params[0] : null;
      
      return this.data.employees
        .filter(e => isManagerQuery ? (e.managerId === managerId || e.id === managerId) : true)
        .map(e => {
          const dept = this.data.departments.find(d => d.id === e.departmentId);
          const mgr = this.data.employees.find(m => m.id === e.managerId);
          return { ...e, departmentName: dept ? dept.name : '', managerName: mgr ? mgr.fullName : '' };
        });
    }

    if (cleanSql.includes('FROM departments')) {
      return this.data.departments.map(d => {
        const count = this.data.employees.filter(e => e.departmentId === d.id).length;
        return { ...d, employeeCount: count };
      });
    }

    if (cleanSql.includes('FROM leave_balances')) {
      if (cleanSql.includes('WHERE id =')) {
        const targetId = params[0];
        return this.data.leave_balances.filter(b => b.id === targetId);
      }
      
      const hasEmpId = cleanSql.includes('employeeId =');
      const hasLeaveType = cleanSql.includes('leaveType =');
      const hasYear = cleanSql.includes('year =');

      let paramIdx = 0;
      const targetEmpId = hasEmpId ? params[paramIdx++] : null;
      const targetLeaveType = hasLeaveType ? params[paramIdx++] : null;
      const targetYear = hasYear ? params[paramIdx++] : null;

      return this.data.leave_balances.filter(b => {
        let match = true;
        if (targetEmpId) match = match && b.employeeId === targetEmpId;
        if (targetLeaveType) match = match && b.leaveType === targetLeaveType;
        if (targetYear !== null && targetYear !== undefined) match = match && b.year === Number(targetYear);
        return match;
      });
    }

    if (cleanSql.includes('FROM leave_requests')) {
      const paramId = params[0];
      if (cleanSql.includes('WHERE id =')) {
        return this.data.leave_requests.filter(r => r.id === paramId);
      }
      return this.data.leave_requests.map(r => {
        const emp = this.data.employees.find(e => e.id === r.employeeId);
        const app = this.data.employees.find(a => a.id === r.approverId);
        const dept = emp ? this.data.departments.find(d => d.id === emp.departmentId) : null;
        return {
          ...r,
          employeeName: emp ? emp.fullName : 'Employee',
          departmentName: dept ? dept.name : '',
          approverName: app ? app.fullName : null
        };
      }).filter(r => {
        if (cleanSql.includes('WHERE lr.employeeId =')) return r.employeeId === paramId;
        if (cleanSql.includes('WHERE e.managerId =')) {
          const emp = this.data.employees.find(e => e.id === r.employeeId);
          return emp?.managerId === paramId || r.employeeId === paramId;
        }
        return true;
      });
    }

    if (cleanSql.includes('FROM attendances')) {
      const [empId, date] = params;
      if (cleanSql.includes('WHERE employeeId = ? AND date = ?')) {
        return this.data.attendances.filter(a => a.employeeId === empId && a.date === date);
      }
      return this.data.attendances.map(a => {
        const emp = this.data.employees.find(e => e.id === a.employeeId);
        return { ...a, employeeName: emp ? emp.fullName : 'Employee' };
      }).filter(a => {
        if (cleanSql.includes('WHERE a.employeeId =')) return a.employeeId === empId;
        return true;
      });
    }

    return [];
  }
}

const dbInstance = new LocalDatabase();

export async function getDb() {
  return dbInstance;
}
