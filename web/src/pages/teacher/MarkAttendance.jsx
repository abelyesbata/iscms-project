import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function MarkAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchClasses = async () => {
      try {
        const res = await API.get('/classes');
        if (!cancelled) {
          const myClasses = (res.data.classes || []).filter(
            (c) => c.homeroomTeacher?._id === user.id
          );
          setClasses(myClasses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchClasses();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    setMessage(null);

    const cls = classes.find((c) => c._id === classId);
    if (!cls) {
      setStudents([]);
      setAttendance({});
      return;
    }

    setStudents(cls.students || []);

    // Default all to "present"
    const initial = {};
    (cls.students || []).forEach((s) => {
      initial[s._id] = 'present';
    });
    setAttendance(initial);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendance(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      setMessage({ type: 'error', text: 'Please select a class' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendance[s._id] || 'present'
      }));

      const res = await API.post('/attendance/mark-bulk', {
        classroomId: selectedClass,
        date: attendanceDate,
        records
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'Attendance saved successfully'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save attendance'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading classes...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record daily attendance for your students
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassSelect(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} ({c.students?.length || 0} students)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {students.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => markAll('present')}
              className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('absent')}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg"
            >
              All Absent
            </button>
          </>
        )}
      </div>

      {/* Student list */}
      {classes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          You are not assigned to any class as homeroom teacher.
        </div>
      ) : !selectedClass ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          Select a class to start marking attendance.
        </div>
      ) : students.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          This class has no students yet.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-800">{s.fullName}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {['present', 'absent', 'late', 'excused'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(s._id, status)}
                          className={`text-xs px-3 py-1 rounded-full border capitalize ${
                            attendance[s._id] === status
                              ? status === 'present'
                                ? 'bg-green-500 text-white border-green-500'
                                : status === 'absent'
                                ? 'bg-red-500 text-white border-red-500'
                                : status === 'late'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.values(attendance).filter((v) => v === 'present').length} present ·{' '}
              {Object.values(attendance).filter((v) => v === 'absent').length} absent
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}