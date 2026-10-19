import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function RegistrarReports() {
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [finRes, teachRes, classRes] = await Promise.all([
          API.get('/reports/finance/summary').catch(() => ({ data: null })),
          API.get('/reports/teacher/performance').catch(() => ({ data: { performance: [] } })),
          API.get('/classes').catch(() => ({ data: { classes: [] } }))
        ]);

        if (!cancelled) {
          setFinance(finRes.data);
          setTeachers(teachRes.data.performance || []);
          setClasses(classRes.data.classes || []);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
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
    return <div className="text-center py-12 text-gray-500">Loading reports...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          System-wide analytics and summaries
        </p>
      </div>

      {/* Finance Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">💰 Finance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Collected"
            value={`${finance?.summary?.totalPaid || 0} Birr`}
            color="bg-emerald-500"
          />
          <MetricCard
            title="Paid"
            value={finance?.summary?.paidCount || 0}
            color="bg-green-500"
          />
          <MetricCard
            title="Pending"
            value={finance?.summary?.pendingCount || 0}
            color="bg-yellow-500"
          />
          <MetricCard
            title="Penalties"
            value={`${finance?.summary?.totalPenalties || 0} Birr`}
            color="bg-red-500"
          />
        </div>
      </section>

      {/* Classes */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">🏫 Classes Overview</h2>
        {classes.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No classes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div key={c._id} className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-bold text-gray-800">{c.className}</h3>
                <p className="text-sm text-gray-500">
                  {c.gradeLevel} - Section {c.section}
                </p>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>👥 Capacity: {c.capacity}</p>
                  <p>🎓 Enrolled: {c.students?.length || 0}</p>
                  <p>
                    👩‍🏫 Teacher: {c.homeroomTeacher?.fullName || 'Not assigned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Teacher Performance */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">👩‍🏫 Teacher Performance</h2>
        {teachers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No teacher activity yet.
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

function MetricCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className={`w-10 h-10 ${color} rounded-lg mb-3`}></div>
      <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}