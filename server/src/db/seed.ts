import { getDb } from './database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.exec(`
    DELETE FROM attendances;
    DELETE FROM leave_requests;
    DELETE FROM leave_balances;
    DELETE FROM employees;
    DELETE FROM departments;
  `);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Departments
  const deptEngId = 'dept-101';
  const deptHrId = 'dept-102';
  const deptSalesId = 'dept-103';

  await db.run(
    `INSERT INTO departments (id, name, departmentCode, location) VALUES (?, ?, ?, ?)`,
    [deptEngId, 'Engineering', 'ENG', 'Building A - Floor 3']
  );
  await db.run(
    `INSERT INTO departments (id, name, departmentCode, location) VALUES (?, ?, ?, ?)`,
    [deptHrId, 'Human Resources', 'HR', 'Building B - Floor 1']
  );
  await db.run(
    `INSERT INTO departments (id, name, departmentCode, location) VALUES (?, ?, ?, ?)`,
    [deptSalesId, 'Sales & Marketing', 'SALES', 'Building A - Floor 2']
  );

  // 2. Create Employees (HR, Manager, Employee + team members)
  const hrId = 'emp-001';
  const managerId = 'emp-002';
  const empId = 'emp-003';
  const empId2 = 'emp-004';
  const empId3 = 'emp-005';

  // HR Admin
  await db.run(
    `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hrId, 'EMP-1001', 'Sarah Jenkins (HR)', 'hr@employeehub.com', passwordHash, '+1 555-0101', deptHrId, null, '2022-01-15', 'Active', 'HR_ADMIN']
  );

  // Manager
  await db.run(
    `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [managerId, 'EMP-1002', 'Alex Vance (Manager)', 'manager@employeehub.com', passwordHash, '+1 555-0102', deptEngId, hrId, '2022-03-01', 'Active', 'MANAGER']
  );

  // Employee 1
  await db.run(
    `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [empId, 'EMP-1003', 'John Doe (Employee)', 'employee@employeehub.com', passwordHash, '+1 555-0103', deptEngId, managerId, '2023-06-10', 'Active', 'EMPLOYEE']
  );

  // Employee 2
  await db.run(
    `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [empId2, 'EMP-1004', 'Emily Watson', 'emily.watson@employeehub.com', passwordHash, '+1 555-0104', deptEngId, managerId, '2023-08-01', 'Active', 'EMPLOYEE']
  );

  // Employee 3
  await db.run(
    `INSERT INTO employees (id, employeeId, fullName, email, passwordHash, phone, departmentId, managerId, joiningDate, employmentStatus, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [empId3, 'EMP-1005', 'Michael Brown', 'michael.brown@employeehub.com', passwordHash, '+1 555-0105', deptSalesId, hrId, '2024-01-10', 'Active', 'EMPLOYEE']
  );

  // 3. Create Leave Balances for 2026
  const employees = [hrId, managerId, empId, empId2, empId3];
  const currentYear = new Date().getFullYear();

  for (const eId of employees) {
    // Casual Leave
    await db.run(
      `INSERT INTO leave_balances (id, employeeId, leaveType, allocatedDays, usedDays, remainingDays, year) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`lb-${eId}-casual`, eId, 'Casual Leave', 12, 2, 10, currentYear]
    );
    // Sick Leave
    await db.run(
      `INSERT INTO leave_balances (id, employeeId, leaveType, allocatedDays, usedDays, remainingDays, year) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`lb-${eId}-sick`, eId, 'Sick Leave', 10, 1, 9, currentYear]
    );
    // Earned Leave
    await db.run(
      `INSERT INTO leave_balances (id, employeeId, leaveType, allocatedDays, usedDays, remainingDays, year) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`lb-${eId}-earned`, eId, 'Earned Leave', 15, 0, 15, currentYear]
    );
  }

  // 4. Create Sample Leave Requests
  await db.run(
    `INSERT INTO leave_requests (id, employeeId, leaveType, startDate, endDate, numberOfDays, reason, status, approverId, managerComments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['req-101', empId, 'Casual Leave', '2026-10-15', '2026-10-16', 2, 'Family function attendance', 'Pending', managerId, null]
  );

  await db.run(
    `INSERT INTO leave_requests (id, employeeId, leaveType, startDate, endDate, numberOfDays, reason, status, approverId, managerComments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['req-102', empId2, 'Sick Leave', '2026-10-02', '2026-10-02', 1, 'Doctor appointment', 'Approved', managerId, 'Approved. Take care!']
  );

  await db.run(
    `INSERT INTO leave_requests (id, employeeId, leaveType, startDate, endDate, numberOfDays, reason, status, approverId, managerComments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['req-103', empId, 'Earned Leave', '2026-09-01', '2026-09-05', 5, 'Annual vacation', 'Approved', managerId, 'Approved. Enjoy!']
  );

  // 5. Create Attendance Records for Recent Dates
  const today = new Date().toISOString().split('T')[0];
  await db.run(
    `INSERT INTO attendances (id, employeeId, date, checkIn, checkOut, status, workingHours, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['att-101', empId, today, `${today} 09:15:00`, `${today} 17:30:00`, 'Present', 8.25, 'On time']
  );

  await db.run(
    `INSERT INTO attendances (id, employeeId, date, checkIn, checkOut, status, workingHours, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['att-102', empId2, today, `${today} 09:45:00`, `${today} 18:00:00`, 'Late', 8.25, 'Traffic delay']
  );

  console.log('✅ Database seeded successfully!');
  console.log('   Demo Accounts created:');
  console.log('   - Employee: employee@employeehub.com / Password123!');
  console.log('   - Manager: manager@employeehub.com / Password123!');
  console.log('   - HR Admin: hr@employeehub.com / Password123!');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(console.error);
}
