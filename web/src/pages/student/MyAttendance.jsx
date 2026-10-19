import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function MyAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAttendance = async () => {
      try {
        const res = await API.get(`/attendance/student/${user.id}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAttendance();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading attendance...</div>;
  }

  const summary = data?.summary || {};
  const records = data?.records || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your attendance history and rate
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard label="Total" value={summary.total || 0} color="bg-gray-500" />
        <SummaryCard label="Present" value={summary.present || 0} color="bg-green-500" />
        <SummaryCard label="Absent" value={summary.absent || 0} color="bg-red-500" />
        <SummaryCard label="Late" value={summary.late || 0} color="bg-yellow-500" />
        <SummaryCard label="Excused" value={summary.excused || 0} color="bg-blue-500" />
      </div>

      {/* Rate */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Attendance Rate</p>
            <p className="text-3xl font-bold text-gray-800">
              {summary.attendanceRate || '0%'}
            </p>
          </div>
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ${
              parseFloat(summary.attendanceRate) >= 90
                ? 'bg-green-500'
                : parseFloat(summary.attendanceRate) >= 75
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          >
            {summary.attendanceRate || '0%'}
          </div>
        </div>
      </div>

      {/* Records */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">📅 Attendance Records</h2>
        {records.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No attendance records yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Class
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {r.classroom?.className || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className={`w-8 h-8 ${color} rounded mb-2`}></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    excused: 'bg-blue-100 text-blue-800'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded capitalize ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}