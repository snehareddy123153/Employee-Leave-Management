import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Employee, LeaveRequest, Attendance } from '../types';
import { Users, UserCheck, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const [team, setTeam] = useState<Employee[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, reqRes, attRes] = await Promise.all([
        API.get('/employees'),
        API.get('/leave/requests'),
        API.get('/attendance')
      ]);
      setTeam(teamRes.data);
      setPendingRequests(reqRes.data.filter((r: LeaveRequest) => r.status === 'Pending'));
      setAttendance(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    const comments = prompt('Enter manager approval comments:', 'Approved by Manager');
    if (comments === null) return;

    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await API.patch(`/leave/requests/${id}/approve`, { comments });
    } catch (err: any) {
      // Fail-safe
    }
    fetchData();
  };

  const handleReject = async (id: string) => {
    const comments = prompt('Enter rejection reason:', 'Rejected by Manager');
    if (comments === null) return;

    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await API.patch(`/leave/requests/${id}/reject`, { comments });
    } catch (err: any) {
      // Fail-safe
    }
    fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Team overview, pending approvals, and team attendance metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="card-grid">
        <div className="card">
          <div className="card-title">Team Size</div>
          <div className="card-value" style={{ color: '#2563eb' }}>{team.length} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Employees</span></div>
        </div>

        <div className="card">
          <div className="card-title">Pending Approvals</div>
          <div className="card-value" style={{ color: '#d97706' }}>{pendingRequests.length} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Requests</span></div>
        </div>

        <div className="card">
          <div className="card-title">Present Today</div>
          <div className="card-value" style={{ color: '#16a34a' }}>
            {attendance.filter((a) => a.date === new Date().toISOString().split('T')[0] && (a.status === 'Present' || a.status === 'Late')).length}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="table-card" style={{ marginBottom: '28px' }}>
        <div className="table-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Pending Team Leave Approvals</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No pending leave requests awaiting approval.
                </td>
              </tr>
            ) : (
              pendingRequests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.employeeName}</td>
                  <td>{r.leaveType}</td>
                  <td>{r.startDate}</td>
                  <td>{r.endDate}</td>
                  <td>{r.numberOfDays} days</td>
                  <td>{r.reason}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprove(r.id)} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                    <button onClick={() => handleReject(r.id)} className="btn btn-danger btn-sm">
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
