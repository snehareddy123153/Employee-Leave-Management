import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserPlus, CheckCircle, AlertCircle, X } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-101');
  const [managerId, setManagerId] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN'>('EMPLOYEE');

  const isHrAdmin = user?.role === 'HR_ADMIN';

  const fetchEmployees = () => {
    setLoading(true);
    API.get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await API.post('/employees', {
        fullName,
        email,
        password,
        phone,
        departmentId,
        managerId: managerId || null,
        joiningDate,
        role
      });

      setSuccessMsg(`Employee '${fullName}' (${email}) created successfully! Password: ${password}`);
      setShowModal(false);
      
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setManagerId('');
      setRole('EMPLOYEE');

      // Refresh list
      fetchEmployees();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to create employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage organization employees, security roles, and credentials</p>
        </div>
        {isHrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} />
            <span>+ Add Employee</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} color="#166534" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Manager</th>
              <th>Joining Date</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600, color: '#2563eb' }}>{emp.employeeId}</td>
                <td style={{ fontWeight: 600 }}>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{emp.departmentName || '-'}</td>
                <td>{emp.managerName || 'None'}</td>
                <td>{emp.joiningDate}</td>
                <td><span className="user-badge">{emp.role}</span></td>
                <td>
                  <span className={`badge badge-${(emp.employmentStatus || 'Active').toLowerCase()}`}>
                    {emp.employmentStatus || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Employee (HR Portal)</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Robert Vance"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="robert@employeehub.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Login Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Secret123!"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-input"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="dept-101">Engineering</option>
                    <option value="dept-102">Human Resources</option>
                    <option value="dept-103">Sales & Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reporting Manager</label>
                  <select
                    className="form-input"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                  >
                    <option value="">None (Top Level)</option>
                    {employees.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Access)</option>
                    <option value="MANAGER">MANAGER (Team Approval Access)</option>
                    <option value="HR_ADMIN">HR_ADMIN (Full Admin Access)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Employee...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
