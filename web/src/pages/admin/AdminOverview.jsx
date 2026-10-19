import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/reports/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={stats?.users.total} color="bg-blue-500" />
        <StatCard title="Students" value={stats?.users.students} color="bg-green-500" />
        <StatCard title="Teachers" value={stats?.users.teachers} color="bg-purple-500" />
        <StatCard title="Classes" value={stats?.academics.classes} color="bg-orange-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Attendance" value={stats?.academics.attendanceRecords} color="bg-indigo-500" />
        <StatCard title="Marks" value={stats?.academics.marksEntered} color="bg-pink-500" />
        <StatCard title="Resources" value={stats?.academics.resourcesUploaded} color="bg-teal-500" />
        <StatCard title="Fees Collected" value={`${stats?.finance.totalCollected || 0} Birr`} color="bg-emerald-500" />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction to="/admin/users" label="Manage Users" icon="👥" />
          <QuickAction to="/admin/classes" label="Manage Classes" icon="🏫" />
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className={`w-10 h-10 ${color} rounded-lg mb-3`}></div>
      <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}

function QuickAction({ to, label, icon }) {
  return (
    <Link to={to} className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </Link>
  );
}