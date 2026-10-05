import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Employee, Department, LeaveRequest, Attendance } from '../types';
import { Users, Building2, CalendarDays, CheckCircle2 } from 'lucide-react';

export const HrDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/employees'),
      API.get('/departments'),
      API.get('/leave/requests'),
      API.get('/attendance')
    ])
      .then(([empRes, deptRes, reqRes, attRes]) => {
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
        setRequests(reqRes.data);
        setAttendances(attRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendances.filter((a) => a.date === todayStr && (a.status === 'Present' || a.status === 'Late')).length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">HR & System Executive Dashboard</h1>
          <p className="page-subtitle">Organization-wide workforce metrics, department quotas, and leave analytics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="card-grid">
        <div className="card">
          <div className="card-title">Total Active Employees</div>
          <div className="card-value" style={{ color: '#2563eb' }}>{employees.length}</div>
        </div>

        <div className="card">
          <div className="card-title">Departments</div>
          <div className="card-value" style={{ color: '#0284c7' }}>{departments.length}</div>
        </div>

        <div className="card">
          <div className="card-title">Present Today</div>
          <div className="card-value" style={{ color: '#16a34a' }}>{presentToday}</div>
        </div>

        <div className="card">
          <div className="card-title">Pending Leave Requests</div>
          <div className="card-value" style={{ color: '#d97706' }}>{pendingRequestsCount}</div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="table-card" style={{ marginBottom: '28px' }}>
        <div className="table-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Department Workforce Distribution</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Department Code</th>
              <th>Location</th>
              <th>Total Employees</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td><span className="badge badge-cancelled">{d.departmentCode}</span></td>
                <td>{d.location}</td>
                <td>{d.employeeCount || 0} Employees</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
