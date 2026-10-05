import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('employeehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seed dataset for static hosting fallback (e.g. GitHub Pages)
const getStorageData = () => {
  const stored = localStorage.getItem('employeehub_mock_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  const initialDb = {
    departments: [
      { id: 'dept-101', name: 'Engineering', departmentCode: 'ENG', location: 'Building A - Floor 3' },
      { id: 'dept-102', name: 'Human Resources', departmentCode: 'HR', location: 'Building B - Floor 1' },
      { id: 'dept-103', name: 'Sales & Marketing', departmentCode: 'SALES', location: 'Building A - Floor 2' }
    ],
    employees: [
      { id: 'emp-001', employeeId: 'EMP-1001', fullName: 'Sarah Jenkins (HR)', email: 'hr@employeehub.com', role: 'HR_ADMIN', phone: '+1 555-0101', departmentId: 'dept-102', joiningDate: '2022-01-15', employmentStatus: 'Active' },
      { id: 'emp-002', employeeId: 'EMP-1002', fullName: 'Alex Vance (Manager)', email: 'manager@employeehub.com', role: 'MANAGER', phone: '+1 555-0102', departmentId: 'dept-101', managerId: 'emp-001', joiningDate: '2022-03-01', employmentStatus: 'Active' },
      { id: 'emp-003', employeeId: 'EMP-1003', fullName: 'John Doe (Employee)', email: 'employee@employeehub.com', role: 'EMPLOYEE', phone: '+1 555-0103', departmentId: 'dept-101', managerId: 'emp-002', joiningDate: '2023-06-10', employmentStatus: 'Active' },
      { id: 'emp-004', employeeId: 'EMP-1004', fullName: 'Emily Watson', email: 'emily.watson@employeehub.com', role: 'EMPLOYEE', phone: '+1 555-0104', departmentId: 'dept-101', managerId: 'emp-002', joiningDate: '2023-08-01', employmentStatus: 'Active' },
      { id: 'emp-005', employeeId: 'EMP-1005', fullName: 'Michael Brown', email: 'michael.brown@employeehub.com', role: 'EMPLOYEE', phone: '+1 555-0105', departmentId: 'dept-103', managerId: 'emp-001', joiningDate: '2024-01-10', employmentStatus: 'Active' }
    ],
    leave_balances: [
      { id: 'lb-emp-003-casual', employeeId: 'emp-003', leaveType: 'Casual Leave', allocatedDays: 12, usedDays: 2, remainingDays: 10, year: 2026 },
      { id: 'lb-emp-003-sick', employeeId: 'emp-003', leaveType: 'Sick Leave', allocatedDays: 10, usedDays: 1, remainingDays: 9, year: 2026 },
      { id: 'lb-emp-003-earned', employeeId: 'emp-003', leaveType: 'Earned Leave', allocatedDays: 15, usedDays: 0, remainingDays: 15, year: 2026 },
      { id: 'lb-emp-002-casual', employeeId: 'emp-002', leaveType: 'Casual Leave', allocatedDays: 12, usedDays: 2, remainingDays: 10, year: 2026 },
      { id: 'lb-emp-002-sick', employeeId: 'emp-002', leaveType: 'Sick Leave', allocatedDays: 10, usedDays: 1, remainingDays: 9, year: 2026 },
      { id: 'lb-emp-002-earned', employeeId: 'emp-002', leaveType: 'Earned Leave', allocatedDays: 15, usedDays: 0, remainingDays: 15, year: 2026 },
      { id: 'lb-emp-001-casual', employeeId: 'emp-001', leaveType: 'Casual Leave', allocatedDays: 12, usedDays: 2, remainingDays: 10, year: 2026 },
      { id: 'lb-emp-001-sick', employeeId: 'emp-001', leaveType: 'Sick Leave', allocatedDays: 10, usedDays: 1, remainingDays: 9, year: 2026 },
      { id: 'lb-emp-001-earned', employeeId: 'emp-001', leaveType: 'Earned Leave', allocatedDays: 15, usedDays: 0, remainingDays: 15, year: 2026 }
    ],
    leave_requests: [
      { id: 'req-101', employeeId: 'emp-003', leaveType: 'Casual Leave', startDate: '2026-10-15', endDate: '2026-10-16', numberOfDays: 2, reason: 'Family function attendance', status: 'Pending', approverId: 'emp-002', createdAt: '2026-10-05T15:45:28.037Z' },
      { id: 'req-102', employeeId: 'emp-004', leaveType: 'Sick Leave', startDate: '2026-10-02', endDate: '2026-10-02', numberOfDays: 1, reason: 'Doctor appointment', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Take care!', createdAt: '2026-10-05T15:45:28.038Z' },
      { id: 'req-103', employeeId: 'emp-003', leaveType: 'Earned Leave', startDate: '2026-09-01', endDate: '2026-09-05', numberOfDays: 5, reason: 'Annual vacation', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Enjoy!', createdAt: '2026-10-05T15:45:28.038Z' }
    ],
    attendances: [
      { id: 'att-101', employeeId: 'emp-003', date: '2026-10-05', checkIn: '2026-10-05 09:15:00', checkOut: '2026-10-05 17:30:00', status: 'Present', workingHours: 8.25, remarks: 'On time' },
      { id: 'att-102', employeeId: 'emp-004', date: '2026-10-05', checkIn: '2026-10-05 09:45:00', checkOut: '2026-10-05 18:00:00', status: 'Late', workingHours: 8.25, remarks: 'Traffic delay' }
    ]
  };

  localStorage.setItem('employeehub_mock_db', JSON.stringify(initialDb));
  return initialDb;
};

const saveStorageData = (data: any) => {
  localStorage.setItem('employeehub_mock_db', JSON.stringify(data));
};

// Response interceptor: Handles static site mode seamlessly when no backend API server is available
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if running on static host (GitHub Pages) or if server API returned non-2xx error
    const isStaticOrOffline = !error.response ||
      error.response.status === 404 ||
      error.response.status === 405 ||
      error.response.status === 403 ||
      error.response.status === 502 ||
      window.location.hostname.includes('github.io');

    if (isStaticOrOffline) {
      const url = error.config.url || '';
      const method = (error.config.method || 'get').toLowerCase();
      const body = error.config.data ? JSON.parse(error.config.data) : {};
      const db = getStorageData();

      // Auth Login
      if (url.includes('/auth/login') && method === 'post') {
        const emp = db.employees.find((e: any) => e.email.toLowerCase() === body.email?.toLowerCase());
        if (emp) {
          const token = `mock-token-${emp.id}`;
          localStorage.setItem('employeehub_mock_user', JSON.stringify(emp));
          return {
            data: {
              token,
              user: emp
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          };
        } else {
          return Promise.reject({
            response: {
              data: { error: 'Invalid organization email or password.' },
              status: 400
            }
          });
        }
      }

      // Auth Me
      if (url.includes('/auth/me') && method === 'get') {
        const storedUser = localStorage.getItem('employeehub_mock_user');
        const user = storedUser ? JSON.parse(storedUser) : db.employees[2]; // Default to employee
        return {
          data: { user },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // Leave Balances
      if (url.includes('/leave/balances')) {
        const storedUser = localStorage.getItem('employeehub_mock_user');
        const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
        const balances = db.leave_balances.filter((b: any) => b.employeeId === currentUser.id);
        return {
          data: balances,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // Leave Requests
      if (url.includes('/leave/requests')) {
        if (method === 'get') {
          return {
            data: db.leave_requests,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          };
        }
        if (method === 'post') {
          const storedUser = localStorage.getItem('employeehub_mock_user');
          const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
          const newReq = {
            id: `req-${Date.now()}`,
            employeeId: currentUser.id,
            leaveType: body.leaveType || 'Casual Leave',
            startDate: body.startDate,
            endDate: body.endDate,
            numberOfDays: body.numberOfDays || 1,
            reason: body.reason || 'Leave request',
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          db.leave_requests.unshift(newReq);
          saveStorageData(db);
          return {
            data: newReq,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: error.config
          };
        }
      }

      // Attendance
      if (url.includes('/attendance')) {
        if (url.includes('/check-in') && method === 'post') {
          const storedUser = localStorage.getItem('employeehub_mock_user');
          const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
          const newAtt = {
            id: `att-${Date.now()}`,
            employeeId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            checkIn: new Date().toLocaleTimeString(),
            status: 'Present',
            workingHours: 0,
            remarks: 'Checked in via Web App'
          };
          db.attendances.unshift(newAtt);
          saveStorageData(db);
          return {
            data: newAtt,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          };
        }
        return {
          data: db.attendances,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // Departments
      if (url.includes('/departments')) {
        return {
          data: db.departments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // Employees
      if (url.includes('/employees')) {
        return {
          data: db.employees,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // Reports Summary
      if (url.includes('/reports')) {
        return {
          data: {
            totalEmployees: db.employees.length,
            totalDepartments: db.departments.length,
            pendingLeaves: db.leave_requests.filter((r: any) => r.status === 'Pending').length,
            todayPresent: db.attendances.length
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }
    }

    return Promise.reject(error);
  }
);

export default API;
