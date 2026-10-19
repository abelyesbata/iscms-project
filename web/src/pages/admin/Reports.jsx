import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [finance, setFinance] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [dashboardRes, financeRes, teachersRes] = await Promise.all([
          API.get('/reports/dashboard'),
          API.get('/reports/finance/summary'),
          API.get('/reports/teacher/performance')
        ]);

        if (!cancelled) {
          setDashboard(dashboardRes.data);
          setFinance(financeRes.data);
          setTeachers(teachersRes.data.performance || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load reports');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of school-wide performance metrics
        </p>
      </div>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">📊 Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={dashboard?.users?.total}
            subtitle={`${dashboard?.users?.students || 0} students, ${dashboard?.users?.teachers || 0} teachers`}
            color="blue"
          />
          <MetricCard
            title="Classes"
            value={dashboard?.academics?.classes}
            subtitle="Active classes"
            color="green"
          />
          <MetricCard
            title="Attendance Records"
            value={dashboard?.academics?.attendanceRecords}
            subtitle={`${dashboard?.academics?.todayAttendance || 0} today`}
            color="indigo"
          />
          <MetricCard
            title="Marks Entered"
            value={dashboard?.academics?.marksEntered}
            subtitle={`${dashboard?.academics?.resourcesUploaded || 0} resources`}
            color="purple"
          />
        </div>
      </section>

      {/* Finance Section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">💰 Finance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Collected"
            value={`${finance?.summary?.totalPaid || 0} Birr`}
            subtitle="All payments"
            color="emerald"
          />
          <MetricCard
            title="Paid"
            value={finance?.summary?.paidCount || 0}
            subtitle="Completed"
            color="green"
          />
          <MetricCard
            title="Pending"
            value={finance?.summary?.pendingCount || 0}
            subtitle="Awaiting payment"
            color="yellow"
          />
          <MetricCard
            title="Penalties"
            value={`${finance?.summary?.totalPenalties || 0} Birr`}
            subtitle="Late fees"
            color="red"
          />
        </div>
      </section>

      {/* Teacher Performance Section */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">👩‍🏫 Teacher Performance</h2>
        {teachers.length === 0 ? (
          <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
            No teacher activity recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Classes
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Marks
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Resources
                  </th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.teacher.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-800">{t.teacher.name}</div>
                      <div className="text-xs text-gray-500">{t.teacher.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{t.classesAsHomeroom}</td>
                    <td className="px-4 py-3 text-sm text-center">{t.attendanceMarked}</td>
                    <td className="px-4 py-3 text-sm text-center">{t.marksEntered}</td>
                    <td className="px-4 py-3 text-sm text-center">{t.resourcesUploaded}</td>
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

function MetricCard({ title, value, subtitle, color }) {
  const colors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    indigo: 'border-l-indigo-500',
    purple: 'border-l-purple-500',
    emerald: 'border-l-emerald-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500'
  };

  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${colors[color] || 'border-l-gray-500'}`}>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}