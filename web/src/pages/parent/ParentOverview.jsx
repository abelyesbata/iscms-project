import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function ParentOverview() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({
    grades: null,
    attendance: null,
    payments: null
  });

  // Initial load — children
  useEffect(() => {
    let cancelled = false;

    const fetchChildren = async () => {
      try {
        const res = await API.get('/auth/my-children');
        if (!cancelled) {
          const kids = res.data.children || [];
          setChildren(kids);
          if (kids.length > 0) {
            setSelectedChild(kids[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load children:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChildren();
    return () => {
      cancelled = true;
    };
  }, []);

  // When child selected, fetch their data
  useEffect(() => {
    if (!selectedChild) return;

    let cancelled = false;

    const fetchChildData = async () => {
      try {
        const [gradesRes, attRes, payRes] = await Promise.all([
          API.get(`/grades/student/${selectedChild._id}`).catch(() => ({ data: null })),
          API.get(`/attendance/student/${selectedChild._id}`).catch(() => ({ data: null })),
          API.get(`/payments/student/${selectedChild._id}`).catch(() => ({ data: null }))
        ]);

        if (!cancelled) {
          setChildData({
            grades: gradesRes.data,
            attendance: attRes.data,
            payments: payRes.data
          });
        }
      } catch (err) {
        console.error('Failed to load child data:', err);
      }
    };

    fetchChildData();
    return () => {
      cancelled = true;
    };
  }, [selectedChild]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (children.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Parent Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">No children linked to your account</p>
          <p className="text-sm text-yellow-700">
            Please contact the school administrator to link your child's account.
          </p>
        </div>
      </div>
    );
  }

  const overallAvg = childData.grades?.subjectSummary?.length
    ? Math.round(
        (childData.grades.subjectSummary.reduce((sum, s) => sum + s.average, 0) /
          childData.grades.subjectSummary.length) *
          100
      ) / 100
    : 0;

  const attendanceRate = childData.attendance?.summary?.attendanceRate || '0%';

  const totalPaid = childData.payments?.summary?.totalPaid || 0;
  const totalPenalty = childData.payments?.summary?.totalPenalty || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your child's academic progress
        </p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Select Child:
          </label>
          <select
            value={selectedChild?._id || ''}
            onChange={(e) => {
              const c = children.find((k) => k._id === e.target.value);
              setSelectedChild(c);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          >
            {children.map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Child info */}
      <div className="bg-white rounded-lg shadow p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {selectedChild?.fullName?.charAt(0) || '?'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{selectedChild?.fullName}</h2>
          <p className="text-sm text-gray-500">{selectedChild?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Overall Average"
          value={`${overallAvg}%`}
          color="bg-blue-500"
        />
        <StatCard
          title="Attendance Rate"
          value={attendanceRate}
          color="bg-green-500"
        />
        <StatCard
          title="Total Paid"
          value={`${totalPaid} Birr`}
          color="bg-emerald-500"
        />
        <StatCard
          title="Penalties"
          value={`${totalPenalty} Birr`}
          color="bg-red-500"
        />
      </div>

      {/* Quick summary sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📝 Recent Grades</h3>
          {childData.grades?.subjectSummary?.length > 0 ? (
            <ul className="space-y-2">
              {childData.grades.subjectSummary.slice(0, 5).map((s) => (
                <li key={s.subject} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{s.subject}</span>
                  <span className="text-sm font-bold text-gray-800">{s.average}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No grades yet</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💰 Recent Payments</h3>
          {childData.payments?.payments?.length > 0 ? (
            <ul className="space-y-2">
              {childData.payments.payments.slice(0, 5).map((p) => (
                <li key={p._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{p.periodLabel}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : p.status === 'overdue'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No payments yet</p>
          )}
        </section>
      </div>
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