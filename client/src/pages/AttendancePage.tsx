import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Attendance } from '../types';
import { Clock } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/attendance')
      .then((res) => setAttendances(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-subtitle">Track daily clock-in/out timestamps and working hours</p>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No attendance records logged yet.
                </td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr key={att.id}>
                  <td style={{ fontWeight: 600 }}>{att.date}</td>
                  <td>{att.employeeName || 'Self'}</td>
                  <td>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '-'}</td>
                  <td>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}</td>
                  <td>
                    <span className={`badge badge-${att.status.toLowerCase()}`}>
                      {att.status}
                    </span>
                  </td>
                  <td>{att.workingHours ? `${att.workingHours} hrs` : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
