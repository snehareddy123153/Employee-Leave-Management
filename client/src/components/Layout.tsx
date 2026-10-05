import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  Building2,
  FileText,
  UserCheck,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'EMPLOYEE': return 'Employee';
      case 'MANAGER': return 'Manager';
      case 'HR_ADMIN': return 'HR / Admin';
      default: return 'User';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Building2 size={24} color="#38bdf8" />
          <span className="sidebar-brand">EmployeeHub</span>
        </div>

        <nav className="sidebar-nav">
          {/* Employee Navigation */}
          {user?.role === 'EMPLOYEE' && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={18} />
                <span>My Attendance</span>
              </NavLink>
              <NavLink to="/leave" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarDays size={18} />
                <span>My Leave Requests</span>
              </NavLink>
            </>
          )}

          {/* Manager Navigation */}
          {user?.role === 'MANAGER' && (
            <>
              <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Manager Dashboard</span>
              </NavLink>
              <NavLink to="/manager/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>My Team</span>
              </NavLink>
              <NavLink to="/manager/approvals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>Pending Approvals</span>
              </NavLink>
              <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={18} />
                <span>Team Attendance</span>
              </NavLink>
            </>
          )}

          {/* HR Admin Navigation */}
          {user?.role === 'HR_ADMIN' && (
            <>
              <NavLink to="/hr/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>HR Dashboard</span>
              </NavLink>
              <NavLink to="/hr/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Employees</span>
              </NavLink>
              <NavLink to="/hr/departments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={18} />
                <span>Departments</span>
              </NavLink>
              <NavLink to="/leave" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarDays size={18} />
                <span>Leave Management</span>
              </NavLink>
              <NavLink to="/hr/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Reports & Analytics</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Employee Leave & Attendance Portal</h3>
          </div>
          <div className="topbar-user">
            <span className="user-badge">{getRoleLabel()}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.fullName}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
