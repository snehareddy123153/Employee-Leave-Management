import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { HrDashboard } from './pages/HrDashboard';
import { EmployeesPage } from './pages/EmployeesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'EMPLOYEE') return <Navigate to="/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
  if (user.role === 'HR_ADMIN') return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<UnauthorizedPage />} />

          {/* Authenticated Routes with Sidebar/Topbar Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Shared / Employee Routes */}
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leave" element={<LeavePage />} />

              {/* Manager Routes */}
              <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']} />}>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/team" element={<EmployeesPage />} />
                <Route path="/manager/approvals" element={<LeavePage />} />
              </Route>

              {/* HR Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['HR_ADMIN']} />}>
                <Route path="/hr/dashboard" element={<HrDashboard />} />
                <Route path="/hr/employees" element={<EmployeesPage />} />
                <Route path="/hr/departments" element={<DepartmentsPage />} />
                <Route path="/hr/reports" element={<ReportsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
