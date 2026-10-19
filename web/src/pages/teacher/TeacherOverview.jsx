import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function TeacherOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [classesRes, announceRes] = await Promise.all([
          API.get('/classes').catch(() => ({ data: { classes: [] } })),
          API.get('/announcements/active').catch(() => ({ data: { announcements: [] } }))
        ]);

        if (!cancelled) {
          // Filter classes where this teacher is homeroom teacher
          const myClasses = (classesRes.data.classes || []).filter(
            (c) => c.homeroomTeacher?._id === user.id
          );
          setClasses(myClasses);
          setAnnouncements(announceRes.data.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load teacher overview:', err);
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

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.students?.length || 0),
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your classes and activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="My Classes" value={classes.length} color="bg-blue-500" />
        <StatCard title="Total Students" value={totalStudents} color="bg-green-500" />
        <StatCard title="Announcements" value={announcements.length} color="bg-orange-500" />
        <StatCard title="Today" value={new Date().toLocaleDateString()} color="bg-purple-500" />
      </div>

      {/* My Classes */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">🏫 My Classes</h2>
        {classes.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            You are not assigned to any class as homeroom teacher yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls._id} className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-bold text-gray-800">{cls.className}</h3>
                <p className="text-sm text-gray-500">
                  {cls.gradeLevel} - Section {cls.section}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  🎓 {cls.students?.length || 0} students
                </p>
                <p className="text-sm text-gray-600">
                  📅 {cls.academicYear}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active announcements */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">📢 Recent Announcements</h2>
        {announcements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No active announcements.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((a) => (
              <div key={a._id} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-blue-500">
                <h3 className="font-medium text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  By {a.publishedBy?.fullName} · {new Date(a.createdAt).toLocaleDateString()}
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