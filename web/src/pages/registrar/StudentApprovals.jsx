import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function StudentApprovals() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStudents = async () => {
      try {
        const res = await API.get('/auth/users?role=student');
        if (!cancelled) {
          setStudents(res.data.users || []);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    try {
      const res = await API.get('/auth/users?role=student');
      setStudents(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (student) => {
    try {
      await API.put(`/auth/users/${student._id}`, {
        isActive: !student.isActive
      });
      setMessage({
        type: 'success',
        text: `${student.fullName} is now ${!student.isActive ? 'active' : 'inactive'}`
      });
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading students...</div>;
  }

  const pending = students.filter((s) => !s.isActive);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve or deactivate student accounts
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

      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ {pending.length} student(s) pending approval
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{s.fullName}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3 text-center">
                    {s.isActive ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`text-xs px-3 py-1 rounded ${
                        s.isActive
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {s.isActive ? 'Deactivate' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}