import axios from 'axios';

// Seed dataset for static hosting fallback (e.g. GitHub Pages)
const getStorageData = () => {
  const stored = localStorage.getItem('employeehub_mock_db');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.leave_requests)) {
        return parsed;
      }
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
      { id: 'req-101', employeeId: 'emp-003', employeeName: 'John Doe (Employee)', leaveType: 'Casual Leave', startDate: '2026-10-15', endDate: '2026-10-16', numberOfDays: 2, reason: 'Family function attendance', status: 'Pending', approverId: 'emp-002', createdAt: '2026-10-05T15:45:28.037Z' },
      { id: 'req-102', employeeId: 'emp-004', employeeName: 'Emily Watson', leaveType: 'Sick Leave', startDate: '2026-10-02', endDate: '2026-10-02', numberOfDays: 1, reason: 'Doctor appointment', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Take care!', createdAt: '2026-10-05T15:45:28.038Z' },
      { id: 'req-103', employeeId: 'emp-003', employeeName: 'John Doe (Employee)', leaveType: 'Earned Leave', startDate: '2026-09-01', endDate: '2026-09-05', numberOfDays: 5, reason: 'Annual vacation', status: 'Approved', approverId: 'emp-002', managerComments: 'Approved. Enjoy!', createdAt: '2026-10-05T15:45:28.038Z' }
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

const handleMockRequest = async (config: any) => {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  
  let body: any = {};
  if (config.data) {
    if (typeof config.data === 'string') {
      try {
        body = JSON.parse(config.data);
      } catch (e) {
        body = {};
      }
    } else if (typeof config.data === 'object') {
      body = config.data;
    }
  }

  const db = getStorageData();

  // Auth Login
  if (url.includes('/auth/login') && method === 'post') {
    const inputEmail = (body.email || '').trim().toLowerCase();
    let emp = db.employees.find((e: any) => e.email.toLowerCase() === inputEmail);
    
    if (!emp) {
      if (inputEmail.includes('hr')) {
        emp = db.employees.find((e: any) => e.role === 'HR_ADMIN');
      } else if (inputEmail.includes('manager')) {
        emp = db.employees.find((e: any) => e.role === 'MANAGER');
      } else {
        emp = db.employees.find((e: any) => e.role === 'EMPLOYEE') || db.employees[2];
      }
    }

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
      config
    };
  }

  // Auth Me
  if (url.includes('/auth/me') && method === 'get') {
    const storedUser = localStorage.getItem('employeehub_mock_user');
    const user = storedUser ? JSON.parse(storedUser) : db.employees[2];
    return {
      data: { user },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  }

  // Leave Balances
  if (url.includes('/leave/balances')) {
    const storedUser = localStorage.getItem('employeehub_mock_user');
    const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
    const balances = db.leave_balances.filter((b: any) => b.employeeId === currentUser.id);
    return {
      data: balances.length > 0 ? balances : db.leave_balances.slice(0, 3),
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  }

  // Leave Requests / Leave Apply
  if (url.includes('/leave/requests') || url.includes('/leave/apply')) {
    if (method === 'get') {
      return {
        data: db.leave_requests,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }
    if (method === 'post') {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      
      let numDays = body.numberOfDays || 1;
      if (body.startDate && body.endDate) {
        const start = new Date(body.startDate);
        const end = new Date(body.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        if (diff > 0) numDays = diff;
      }

      const newReq = {
        id: `req-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.fullName || 'John Doe (Employee)',
        leaveType: body.leaveType || 'Casual Leave',
        startDate: body.startDate || new Date().toISOString().split('T')[0],
        endDate: body.endDate || new Date().toISOString().split('T')[0],
        numberOfDays: numDays,
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
        config
      };
    }
    if (method === 'patch') {
      const reqId = url.split('/leave/requests/')[1]?.split('/')[0];
      const action = url.includes('/approve') ? 'Approved' : url.includes('/reject') ? 'Rejected' : 'Cancelled';
      const targetReq = db.leave_requests.find((r: any) => r.id === reqId);
      if (targetReq) {
        targetReq.status = action;
        if (body.comments) targetReq.managerComments = body.comments;
        saveStorageData(db);
      }
      return {
        data: targetReq || { status: action },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
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
        remarks: body.remarks || 'Checked in via Web App'
      };
      db.attendances.unshift(newAtt);
      saveStorageData(db);
      return {
        data: newAtt,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }
    if (url.includes('/check-out') && method === 'post') {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      const todayStr = new Date().toISOString().split('T')[0];
      let att = db.attendances.find((a: any) => a.employeeId === currentUser.id && a.date === todayStr);
      if (att) {
        att.checkOut = new Date().toLocaleTimeString();
        att.workingHours = 8;
        saveStorageData(db);
      }
      return {
        data: att || { status: 'Checked Out' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }
    if (url.includes('/today')) {
      const storedUser = localStorage.getItem('employeehub_mock_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : db.employees[2];
      const todayAtt = db.attendances.find((a: any) => a.employeeId === currentUser.id) || null;
      return {
        data: todayAtt,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }
    return {
      data: db.attendances,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  }

  // Departments
  if (url.includes('/departments')) {
    if (method === 'post') {
      const newDept = {
        id: `dept-${Date.now()}`,
        name: body.name || 'New Department',
        departmentCode: body.departmentCode || 'DEPT',
        location: body.location || 'Main Building'
      };
      db.departments.push(newDept);
      saveStorageData(db);
      return {
        data: newDept,
        status: 201,
        statusText: 'Created',
        headers: {},
        config
      };
    }
    return {
      data: db.departments,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
  }

  // Employees
  if (url.includes('/employees')) {
    if (method === 'post') {
      const newEmp = {
        id: `emp-${Date.now()}`,
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: body.fullName || 'New Staff',
        email: body.email || 'staff@employeehub.com',
        role: body.role || 'EMPLOYEE',
        phone: body.phone || '+1 555-0000',
        departmentId: body.departmentId || 'dept-101',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentStatus: 'Active'
      };
      db.employees.push(newEmp);
      saveStorageData(db);
      return {
        data: newEmp,
        status: 201,
        statusText: 'Created',
        headers: {},
        config
      };
    }
    return {
      data: db.employees,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
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
      config
    };
  }

  return {
    data: [],
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  };
};

const API = axios.create({
  baseURL: '/api',
  adapter: async (config) => {
    // Hosted on GitHub Pages or static environment: execute mock adapter directly in memory
    if (window.location.hostname.includes('github.io') || window.location.hostname !== 'localhost') {
      return handleMockRequest(config);
    }

    // Attempt network request for local dev with backend server
    try {
      const defaultAdapter = axios.defaults.adapter;
      if (typeof defaultAdapter === 'function') {
        return await defaultAdapter(config);
      }
    } catch (e) {
      // Fallback
    }

    return handleMockRequest(config);
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('employeehub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extra response interceptor fallback
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isStaticOrOffline = !error.response ||
      error.response.status === 404 ||
      error.response.status === 405 ||
      error.response.status === 403 ||
      error.response.status === 502 ||
      window.location.hostname.includes('github.io');

    if (isStaticOrOffline) {
      return handleMockRequest(error.config || {});
    }

    return Promise.reject(error);
  }
);

export default API;
