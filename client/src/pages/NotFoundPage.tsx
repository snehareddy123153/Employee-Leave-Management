import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <FileQuestion size={64} color="#0284c7" style={{ marginBottom: '16px' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>404 — Page Not Found</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        The requested URL or page location does not exist in EmployeeHub.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};
