import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <ShieldAlert size={64} color="#dc2626" style={{ marginBottom: '16px' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>403 — Unauthorized Access</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        You do not have the required role permissions to view this resource or perform this administrative operation.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};
