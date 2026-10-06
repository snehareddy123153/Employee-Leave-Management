import axios from 'axios';

// Default mock database seed for static hosting (e.g. GitHub Pages)
// Default mock database seed for static hosting (e.g. GitHub Pages)
const getStorageData = () => {
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
      { id: 'req-101', employeeId: 'emp-003', employeeName: 'John Doe (Employee)', leaveType: 'Casual Leave', startDate: '2026-10-15', endDate: '2026-10-16', numberOfDays: 2, reason: 'Family function attendance', status: 'Pending', approverId: 'emp-002', createdAt: '2026-10-05T15:45:28.037Z' },
      { id: 'req-102', employeeId: 'emp-004', employeeName: 'Emily Watson', leaveType: 'Sick Leave', startDate: '2026-10-02', endDate: '2026-10-02', numberOfDays: 1, reason: 'Doctor appointment', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Take care!', createdAt: '2026-10-05T15:45:28.038Z' },
      { id: 'req-103', employeeId: 'emp-003', employeeName: 'John Doe (Employee)', leaveType: 'Earned Leave', startDate: '2026-09-01', endDate: '2026-09-05', numberOfDays: 5, reason: 'Annual vacation', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Enjoy!', createdAt: '2026-10-05T15:45:28.038Z' }
    ],
    attendances: [
      { id: 'att-101', employeeId: 'emp-003', date: '2026-10-05', checkIn: '2026-10-05 09:15:00', checkOut: '2026-10-05 17:30:00', status: 'Present', workingHours: 8.25, remarks: 'On time' },
      { id: 'att-102', employeeId: 'emp-004', date: '2026-10-05', checkIn: '2026-10-05 09:45:00', checkOut: '2026-10-05 18:00:00', status: 'Late', workingHours: 8.25, remarks: 'Traffic delay' }
    ]
  };

  const stored = localStorage.getItem('employeehub_mock_db');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return {
          departments: Array.isArray(parsed.departments) ? parsed.departments : initialDb.departments,
          employees: Array.isArray(parsed.employees) ? parsed.employees : initialDb.employees,
          leave_balances: Array.isArray(parsed.leave_balances) ? parsed.leave_balances : initialDb.leave_balances,
          leave_requests: Array.isArray(parsed.leave_requests) ? parsed.leave_requests : initialDb.leave_requests,
          attendances: Array.isArray(parsed.attendances) ? parsed.attendances : initialDb.attendances,
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  localStorage.setItem('employeehub_mock_db', JSON.stringify(initialDb));
  return initialDb;
};

const saveStorageData = (data: any) => {
  localStorage.setItem('employeehub_mock_db', JSON.stringify(data));
};

const realAxios = axios.create({
  baseURL: '/api',
});

realAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('employeehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isStaticHost = () => {
  return true; // Always enable mock router fallback when backend is un-reachable
};

// In-memory mock router for static hosting (GitHub Pages)
const handleMockRouter = (method: string, url: string, data?: any): Promise<any> => {
  const cleanUrl = url.toLowerCase();
  const cleanMethod = method.toLowerCase();
  const db = getStorageData();

  if (!Array.isArray(db.departments)) db.departments = [];
  if (!Array.isArray(db.employees)) db.employees = [];
  if (!Array.isArray(db.leave_balances)) db.leave_balances = [];
  if (!Array.isArray(db.leave_requests)) db.leave_requests = [];
  if (!Array.isArray(db.attendances)) db.attendances = [];

  // Auth Login
  if (cleanUrl.includes('/auth/login')) {
    const inputEmail = (data?.email || '').trim().toLowerCase();
    let emp = db.employees.find((e: any) => e.email.toLowerCase() === inputEmail);
    if (!emp) {
      if (inputEmail.includes('hr')) {
        emp = db.employees.find((e: any) => e.role === 'HR_ADMIN') || db.employees[0];
      } else if (inputEmail.includes('manager')) {
        emp = db.employees.find((e: any) => e.role === 'MANAGER') || db.employees[1];
      } else {
        emp = db.employees.find((e: any) => e.role === 'EMPLOYEE') || db.employees[2];
      }
    }
    const token = `mock-token-${emp.id}`;
    localStorage.setItem('employeehub_mock_user', JSON.stringify(emp));
    return Promise.resolve({ data: { token, user: emp }, status: 200, statusText: 'OK' });
  }

  // Auth Me
  if (cleanUrl.includes('/auth/me')) {
    const storedUser = localStorage.getItem('employeehub_mock_user');
    const user = storedUser ? JSON.parse(storedUser) : db.employees[2];
    return Promise.resolve({ data: { user }, status: 200, statusText: 'OK' });
  }

  // Leave Balances
  if (cleanUrl.includes('/leave/balances')) {
    const storedUser = localStorage.getItem('employeehub_mock_user');
    const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
    const balances = db.leave_balances.filter((b: any) => b.employeeId === currentUser.id);
    return Promise.resolve({ data: balances.length > 0 ? balances : db.leave_balances.slice(0, 3), status: 200, statusText: 'OK' });
  }

  // Leave Requests / Leave Apply
  if (cleanUrl.includes('/leave/requests') || cleanUrl.includes('/leave/apply')) {
    if (cleanMethod === 'get') {
      return Promise.resolve({ data: db.leave_requests, status: 200, statusText: 'OK' });
    }
    if (cleanMethod === 'post') {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];

      let numDays = data?.numberOfDays || 1;
      if (data?.startDate && data?.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        if (diff > 0) numDays = diff;
      }

      const newReq = {
        id: `req-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.fullName || 'John Doe (Employee)',
        leaveType: data?.leaveType || 'Casual Leave',
        startDate: data?.startDate || new Date().toISOString().split('T')[0],
        endDate: data?.endDate || new Date().toISOString().split('T')[0],
        numberOfDays: numDays,
        reason: data?.reason || 'Leave request',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      db.leave_requests.unshift(newReq);
      saveStorageData(db);

      return Promise.resolve({ data: newReq, status: 201, statusText: 'Created' });
    }
    if (cleanMethod === 'patch') {
      const reqId = cleanUrl.split('/leave/requests/')[1]?.split('/')[0];
      const action = cleanUrl.includes('/approve') ? 'Approved' : cleanUrl.includes('/reject') ? 'Rejected' : 'Cancelled';
      const targetReq = db.leave_requests.find((r: any) => r.id === reqId);
      if (targetReq) {
        targetReq.status = action;
        if (data?.comments) targetReq.managerComments = data.comments;
        saveStorageData(db);
      }
      return Promise.resolve({ data: targetReq || { status: action }, status: 200, statusText: 'OK' });
    }
  }

  // Attendance
  if (cleanUrl.includes('/attendance')) {
    if (cleanUrl.includes('/check-in') && cleanMethod === 'post') {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      const newAtt = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString(),
        status: 'Present',
        workingHours: 0,
        remarks: data?.remarks || 'Checked in via Web App'
      };
      db.attendances.unshift(newAtt);
      saveStorageData(db);
      return Promise.resolve({ data: newAtt, status: 200, statusText: 'OK' });
    }
    if (cleanUrl.includes('/check-out') && cleanMethod === 'post') {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      const todayStr = new Date().toISOString().split('T')[0];
      let att = db.attendances.find((a: any) => a.employeeId === currentUser.id && a.date === todayStr);
      if (att) {
        att.checkOut = new Date().toLocaleTimeString();
        att.workingHours = 8;
        saveStorageData(db);
      }
      return Promise.resolve({ data: att || { status: 'Checked Out' }, status: 200, statusText: 'OK' });
    }
    if (cleanUrl.includes('/today')) {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      const todayAtt = db.attendances.find((a: any) => a.employeeId === currentUser.id) || null;
      return Promise.resolve({ data: todayAtt, status: 200, statusText: 'OK' });
    }
    return Promise.resolve({ data: db.attendances, status: 200, statusText: 'OK' });
  }

  // Departments
  if (cleanUrl.includes('/departments')) {
    if (cleanMethod === 'post') {
      const newDept = {
        id: `dept-${Date.now()}`,
        name: data?.name || 'New Department',
        departmentCode: data?.departmentCode || 'DEPT',
        location: data?.location || 'Main Building'
      };
      db.departments.push(newDept);
      saveStorageData(db);
      return Promise.resolve({ data: newDept, status: 201, statusText: 'Created' });
    }
    return Promise.resolve({ data: db.departments, status: 200, statusText: 'OK' });
  }

  // Employees
  if (cleanUrl.includes('/employees')) {
    if (cleanMethod === 'post') {
      const newEmp = {
        id: `emp-${Date.now()}`,
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: data?.fullName || 'New Staff',
        email: data?.email || 'staff@employeehub.com',
        role: data?.role || 'EMPLOYEE',
        phone: data?.phone || '+1 555-0000',
        departmentId: data?.departmentId || 'dept-101',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentStatus: 'Active'
      };
      db.employees.push(newEmp);
      saveStorageData(db);
      return Promise.resolve({ data: newEmp, status: 201, statusText: 'Created' });
    }
    return Promise.resolve({ data: db.employees, status: 200, statusText: 'OK' });
  }

  // Reports Summary
  if (cleanUrl.includes('/reports')) {
    return Promise.resolve({
      data: {
        totalEmployees: db.employees.length,
        totalDepartments: db.departments.length,
        pendingLeaves: db.leave_requests.filter((r: any) => r.status === 'Pending').length,
        todayPresent: db.attendances.length
      },
      status: 200,
      statusText: 'OK'
    });
  }

  return Promise.resolve({ data: [], status: 200, statusText: 'OK' });
};

// Exported API wrapper object that intercepts calls before network XHR
const API = {
  get: (url: string, config?: any) => {
    if (isStaticHost()) return handleMockRouter('get', url);
    return realAxios.get(url, config).catch(() => handleMockRouter('get', url));
  },
  post: (url: string, data?: any, config?: any) => {
    if (isStaticHost()) return handleMockRouter('post', url, data);
    return realAxios.post(url, data, config).catch(() => handleMockRouter('post', url, data));
  },
  patch: (url: string, data?: any, config?: any) => {
    if (isStaticHost()) return handleMockRouter('patch', url, data);
    return realAxios.patch(url, data, config).catch(() => handleMockRouter('patch', url, data));
  },
  put: (url: string, data?: any, config?: any) => {
    if (isStaticHost()) return handleMockRouter('put', url, data);
    return realAxios.put(url, data, config).catch(() => handleMockRouter('put', url, data));
  },
  delete: (url: string, config?: any) => {
    if (isStaticHost()) return handleMockRouter('delete', url);
    return realAxios.delete(url, config).catch(() => handleMockRouter('delete', url));
  },
  interceptors: realAxios.interceptors
};

export default API;
