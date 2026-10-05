import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Department } from '../types';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Organization departments and office location mapping</p>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>Location</th>
              <th>Employee Count</th>
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
