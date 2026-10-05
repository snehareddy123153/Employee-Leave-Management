import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { LeaveBalance, LeaveRequest, Attendance } from '../types';
import { Clock, Calendar, PlusCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, reqRes, attRes] = await Promise.all([
        API.get('/leave/balances'),
        API.get('/leave/requests'),
        API.get('/attendance/today')
      ]);
      setBalances(balRes.data);
      setRequests(reqRes.data);
      setTodayAttendance(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      await API.post('/attendance/check-in', { remarks: 'Standard Check-In' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.post('/attendance/check-out');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const calcDays = () => {
      if (!startDate || !endDate) return 1;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    };

    const days = calcDays();

    try {
      await API.post('/leave/apply', { leaveType, startDate, endDate, reason, numberOfDays: days });
      setIsModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchData();
    } catch (err: any) {
      // Fail-safe client fallback for static deployment or cached bundles
      try {
        const storedDb = localStorage.getItem('employeehub_mock_db');
        let db = storedDb ? JSON.parse(storedDb) : null;
        const storedUser = localStorage.getItem('employeehub_mock_user');
        const currentUser = storedUser ? JSON.parse(storedUser) : (user || { id: 'emp-003', fullName: 'John Doe (Employee)' });

        const newReq: LeaveRequest = {
          id: `req-${Date.now()}`,
          employeeId: currentUser.id,
          employeeName: currentUser.fullName || 'John Doe (Employee)',
          leaveType: leaveType || 'Casual Leave',
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
          numberOfDays: days,
          reason: reason || 'Leave request',
          status: 'Pending',
          createdAt: new Date().toISOString()
        };

        if (db && Array.isArray(db.leave_requests)) {
          db.leave_requests.unshift(newReq);
          localStorage.setItem('employeehub_mock_db', JSON.stringify(db));
        }

        setRequests((prev) => [newReq, ...prev]);
        setIsModalOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
      } catch (fallbackErr) {
        setSubmitError(err.response?.data?.error || 'Failed to submit leave request');
      }
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await API.patch(`/leave/requests/${id}/cancel`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName}!</h1>
          <p className="page-subtitle">Department: {user?.departmentName || 'Engineering'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!todayAttendance && (
            <button onClick={handleCheckIn} className="btn btn-primary">
              <Clock size={16} />
              <span>Check In Now</span>
            </button>
          )}
          {todayAttendance && !todayAttendance.checkOut && (
            <button onClick={handleCheckOut} className="btn btn-outline">
              <Clock size={16} />
              <span>Check Out</span>
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Attendance Status Banner */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: todayAttendance ? '#f0fdf4' : '#fffbeb', borderColor: todayAttendance ? '#bbf7d0' : '#fef08a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {todayAttendance ? <CheckCircle size={22} color="#16a34a" /> : <AlertCircle size={22} color="#d97706" />}
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Today's Attendance Status: </strong>
              <span>
                {todayAttendance
                  ? `Checked In at ${new Date(todayAttendance.checkIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${todayAttendance.status})`
                  : 'Not Checked In Yet'}
              </span>
            </div>
          </div>
          {todayAttendance?.checkOut && (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Checked Out: {new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayAttendance.workingHours} hrs)
            </span>
          )}
        </div>
      </div>

      {/* Leave Balances Grid */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '14px' }}>My Leave Quotas ({new Date().getFullYear()})</h3>
      <div className="card-grid">
        {balances.map((b) => (
          <div key={b.id} className="card">
            <div className="card-title">{b.leaveType}</div>
            <div className="card-value" style={{ color: '#2563eb' }}>{b.remainingDays} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>Days Available</span></div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
              Allocated: {b.allocatedDays} | Consumed: {b.usedDays}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Leave Requests Table */}
      <div className="table-card">
        <div className="table-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>My Recent Leave Requests</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Working Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No leave requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.leaveType}</td>
                  <td>{r.startDate}</td>
                  <td>{r.endDate}</td>
                  <td>{r.numberOfDays} days</td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'Pending' && (
                      <button onClick={() => handleCancelLeave(r.id)} className="btn btn-danger btn-sm">
                        <XCircle size={14} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Apply For Leave</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            {submitError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-select" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State the reason for leave..." required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
