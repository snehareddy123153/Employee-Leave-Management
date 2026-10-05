import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { LeaveRequest, LeaveBalance } from '../types';

export const LeavePage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/leave/requests'), API.get('/leave/balances')])
      .then(([reqRes, balRes]) => {
        setRequests(reqRes.data);
        setBalances(balRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">View leave balances and submitted leave requests</p>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '24px' }}>
        {balances.map((b) => (
          <div key={b.id} className="card">
            <div className="card-title">{b.leaveType}</div>
            <div className="card-value" style={{ color: '#2563eb' }}>{b.remainingDays} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Days Remaining</span></div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Allocated: {b.allocatedDays} | Used: {b.usedDays}
            </p>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>All Leave Requests</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approver</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.employeeName || 'Self'}</td>
                <td>{r.leaveType}</td>
                <td>{r.startDate}</td>
                <td>{r.endDate}</td>
                <td>{r.numberOfDays}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`badge badge-${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.approverName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
