export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';

export interface User {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: Role;
  departmentId: string;
  departmentName?: string;
  managerId?: string | null;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approverId?: string;
  approverName?: string;
  managerComments?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'Work From Home';
  workingHours?: number;
  remarks?: string;
}

export interface Department {
  id: string;
  name: string;
  departmentCode: string;
  location: string;
  employeeCount?: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  joiningDate: string;
  employmentStatus: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  role: Role;
}
