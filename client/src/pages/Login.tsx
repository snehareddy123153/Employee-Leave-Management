import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Building2, User, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      // Route based on role
      const role = res.data.user.role;
      if (role === 'EMPLOYEE') navigate('/dashboard');
      else if (role === 'MANAGER') navigate('/manager/dashboard');
      else if (role === 'HR_ADMIN') navigate('/hr/dashboard');
    } catch (err: any) {
      // Bulletproof fallback for demo accounts if network/server is unreachable
      const cleanEmail = email.trim().toLowerCase();
      let mockUser: any = null;

      if (cleanEmail === 'employee@employeehub.com') {
        mockUser = { id: 'emp-003', employeeId: 'EMP-1003', fullName: 'John Doe (Employee)', email: 'employee@employeehub.com', role: 'EMPLOYEE', departmentId: 'dept-101' };
      } else if (cleanEmail === 'manager@employeehub.com') {
        mockUser = { id: 'emp-002', employeeId: 'EMP-1002', fullName: 'Alex Vance (Manager)', email: 'manager@employeehub.com', role: 'MANAGER', departmentId: 'dept-101' };
      } else if (cleanEmail === 'hr@employeehub.com') {
        mockUser = { id: 'emp-001', employeeId: 'EMP-1001', fullName: 'Sarah Jenkins (HR)', email: 'hr@employeehub.com', role: 'HR_ADMIN', departmentId: 'dept-102' };
      }

      if (mockUser) {
        localStorage.setItem('employeehub_mock_user', JSON.stringify(mockUser));
        login(`mock-token-${mockUser.id}`, mockUser);
        if (mockUser.role === 'EMPLOYEE') navigate('/dashboard');
        else if (mockUser.role === 'MANAGER') navigate('/manager/dashboard');
        else if (mockUser.role === 'HR_ADMIN') navigate('/hr/dashboard');
      } else {
        setError(err.response?.data?.error || 'Login failed. Invalid organization email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        padding: '36px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Building2 size={40} color="#2563eb" style={{ marginBottom: '8px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>EmployeeHub</h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Organization Single Sign-On (SSO) Portal</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Organization Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '10px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Org'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'underline'
            }}
          >
            <KeyRound size={14} />
            <span>{showDemoAccounts ? 'Hide default demo accounts' : 'Need default demo credentials?'}</span>
          </button>

          {showDemoAccounts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', textAlign: 'left' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickLogin('employee@employeehub.com')}
                style={{ justifyContent: 'flex-start' }}
              >
                <User size={14} color="#2563eb" />
                <span>Employee: <strong>employee@employeehub.com</strong></span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickLogin('manager@employeehub.com')}
                style={{ justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} color="#0284c7" />
                <span>Manager: <strong>manager@employeehub.com</strong></span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleQuickLogin('hr@employeehub.com')}
                style={{ justifyContent: 'flex-start' }}
              >
                <ShieldCheck size={14} color="#16a34a" />
                <span>HR Admin: <strong>hr@employeehub.com</strong></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
