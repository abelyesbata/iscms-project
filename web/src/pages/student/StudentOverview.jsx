import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function StudentOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [gradesRes, attRes, annRes] = await Promise.all([
          API.get(`/grades/student/${user.id}`).catch(() => ({ data: {} })),
          API.get(`/attendance/student/${user.id}`).catch(() => ({ data: {} })),
          API.get('/announcements/active').catch(() => ({ data: { announcements: [] } }))
        ]);

        if (!cancelled) {
          setGrades(gradesRes.data);
          setAttendance(attRes.data);
          setAnnouncements(annRes.data.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load student overview:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  // Calculate overall average from subject summary
  const subjectSummary = grades?.subjectSummary || [];
  const overallAverage = subjectSummary.length
    ? Math.round(
        (subjectSummary.reduce((sum, s) => sum + s.average, 0) / subjectSummary.length) *
          100
      ) / 100
    : 0;

  const attendanceRate = attendance?.summary?.attendanceRate || '0%';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your academic progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Overall Average"
          value={`${overallAverage}%`}
          color="bg-blue-500"
        />
        <StatCard
          title="Subjects"
          value={subjectSummary.length}
          color="bg-purple-500"
        />
        <StatCard
          title="Attendance"
          value={attendanceRate}
          color="bg-green-500"
        />
        <StatCard
          title="Announcements"
          value={announcements.length}
          color="bg-orange-500"
        />
      </div>

      {/* Grades overview */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">📝 Recent Grades</h2>
        {subjectSummary.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No grades recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Average
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectSummary.map((s) => (
                  <tr key={s.subject} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{s.subject}</td>
                    <td className="px-4 py-3 text-sm text-center">{s.average}%</td>
                    <td className="px-4 py-3 text-center">
                      <GradeBadge grade={letterGrade(s.average)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Announcements */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">📢 School Announcements</h2>
        {announcements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No announcements.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-l-blue-500"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800">{a.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      a.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : a.priority === 'high'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  By {a.publishedBy?.fullName} ·{' '}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
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

function GradeBadge({ grade }) {
  const colors = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-orange-100 text-orange-800',
    F: 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded font-bold ${colors[grade] || 'bg-gray-100'}`}>
      {grade}
    </span>
  );
}

function letterGrade(percent) {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}