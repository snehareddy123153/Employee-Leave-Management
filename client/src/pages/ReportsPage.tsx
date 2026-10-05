import React, { useState, useEffect } from 'react';
import API from '../services/api';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<1 | 2 | 3 | 4>(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let endpoint = '';
    switch (activeReport) {
      case 1: endpoint = '/reports/attendance-summary'; break;
      case 2: endpoint = '/reports/leave-summary'; break;
      case 3: endpoint = '/reports/leave-requests'; break;
      case 4: endpoint = '/reports/department-attendance'; break;
    }

    API.get(endpoint)
      .then((res) => setReportData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeReport]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Standard business reports mapping to Salesforce Reports & Dashboards</p>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeReport === 1 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReport(1)}
        >
          Report 1: Attendance Summary
        </button>
        <button
          className={`btn ${activeReport === 2 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReport(2)}
        >
          Report 2: Leave Summary
        </button>
        <button
          className={`btn ${activeReport === 3 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReport(3)}
        >
          Report 3: Leave Requests
        </button>
        <button
          className={`btn ${activeReport === 4 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReport(4)}
        >
          Report 4: Department Attendance
        </button>
      </div>

      {/* Report 1 Table */}
      {activeReport === 1 && (
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Report 1 — Attendance Summary Report</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Present Days</th>
                <th>Late Days</th>
                <th>Absent Days</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.Employee}</td>
                  <td>{row.Department}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{row.Present}</td>
                  <td style={{ color: '#d97706', fontWeight: 600 }}>{row.Late}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.Absent}</td>
                  <td style={{ fontWeight: 700 }}>{row.AttendancePercentage || 100}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 2 Table */}
      {activeReport === 2 && (
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Report 2 — Leave Summary Report</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Casual (Alloc / Used / Rem)</th>
                <th>Sick (Alloc / Used / Rem)</th>
                <th>Earned (Alloc / Used / Rem)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.Employee}</td>
                  <td>{row.casualAllocated} / {row.casualUsed} / <strong style={{ color: '#2563eb' }}>{row.casualRemaining}</strong></td>
                  <td>{row.sickAllocated} / {row.sickUsed} / <strong style={{ color: '#2563eb' }}>{row.sickRemaining}</strong></td>
                  <td>{row.earnedAllocated} / {row.earnedUsed} / <strong style={{ color: '#2563eb' }}>{row.earnedRemaining}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 3 Table */}
      {activeReport === 3 && (
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Report 3 — Leave Requests Log</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Working Days</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.Employee}</td>
                  <td>{row.LeaveType}</td>
                  <td>{row.StartDate}</td>
                  <td>{row.EndDate}</td>
                  <td>{row.Days} days</td>
                  <td><span className={`badge badge-${(row.Status || 'Pending').toLowerCase()}`}>{row.Status || 'Pending'}</span></td>
                  <td>{row.Reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 4 Table */}
      {activeReport === 4 && (
        <div className="table-card">
          <div className="table-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Report 4 — Department Attendance Rate</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employees</th>
                <th>Present Count</th>
                <th>Absent Count</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.Department}</td>
                  <td>{row.Employees} Employees</td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{row.Present}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>{row.Absent}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{row.AttendancePercentage || 100}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
