import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function RegistrarOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          API.get('/reports/dashboard').catch(() => ({ data: null })),
          API.get('/auth/users').catch(() => ({ data: { users: [] } }))
        ]);

        if (!cancelled) {
          setStats({
            dashboard: dashRes.data,
            users: usersRes.data.users || []
          });
        }
      } catch (err) {
        console.error('Failed to load registrar stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const dash = stats?.dashboard;
  const users = stats?.users || [];
  const pending = users.filter((u) => !u.isActive).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of school administration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Students"
          value={dash?.users?.students || 0}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Teachers"
          value={dash?.users?.teachers || 0}
          color="bg-purple-500"
        />
        <StatCard
          title="Classes"
          value={dash?.academics?.classes || 0}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Approvals"
          value={pending}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Attendance Records"
          value={dash?.academics?.attendanceRecords || 0}
          color="bg-indigo-500"
        />
        <StatCard
          title="Marks Entered"
          value={dash?.academics?.marksEntered || 0}
          color="bg-pink-500"
        />
        <StatCard
          title="Resources"
          value={dash?.academics?.resourcesUploaded || 0}
          color="bg-teal-500"
        />
        <StatCard
          title="Fees Collected"
          value={`${dash?.finance?.totalCollected || 0} Birr`}
          color="bg-emerald-500"
        />
      </div>

      {/* Recent registrations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Recent Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No users yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isActive ? (
                      <span className="text-green-600">● Active</span>
                    ) : (
                      <span className="text-gray-400">● Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className={`w-10 h-10 ${color} rounded-lg mb-3`}></div>
      <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}