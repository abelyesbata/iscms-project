import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assigningClass, setAssigningClass] = useState(null);
  const [managingStudentsFor, setManagingStudentsFor] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    className: '',
    gradeLevel: '',
    section: 'A',
    academicYear: '2025/2026',
    capacity: 30
  });

  // Initial load
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [classesRes, teachersRes, studentsRes] = await Promise.all([
          API.get('/classes'),
          API.get('/auth/users?role=teacher'),
          API.get('/auth/users?role=student')
        ]);
        if (!cancelled) {
          setClasses(classesRes.data.classes || []);
          setTeachers(teachersRes.data.users || []);
          setStudents(studentsRes.data.users || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshClasses = async () => {
    try {
      const res = await API.get('/classes');
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error('Failed to refresh classes:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await API.post('/classes', form);
      setMessage({ type: 'success', text: 'Class created successfully' });
      setShowCreateForm(false);
      setForm({
        className: '',
        gradeLevel: '',
        section: 'A',
        academicYear: '2025/2026',
        capacity: 30
      });
      refreshClasses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create class'
      });
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setMessage({ type: 'error', text: 'Please select a teacher' });
      return;
    }

    try {
      await API.put(`/classes/${assigningClass._id}`, {
        homeroomTeacher: selectedTeacher
      });
      setMessage({ type: 'success', text: 'Teacher assigned successfully' });
      setAssigningClass(null);
      setSelectedTeacher('');
      refreshClasses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Assignment failed'
      });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setMessage({ type: 'error', text: 'Please select a student' });
      return;
    }

    try {
      await API.post(`/classes/${managingStudentsFor._id}/students`, {
        studentId: selectedStudent
      });
      setMessage({ type: 'success', text: 'Student added successfully' });
      setSelectedStudent('');
      await refreshClasses();
      // Update the managing view with fresh data
      const res = await API.get('/classes');
      const updated = res.data.classes.find((c) => c._id === managingStudentsFor._id);
      setManagingStudentsFor(updated);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add student'
      });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the class?')) return;

    try {
      await API.delete(`/classes/${managingStudentsFor._id}/students/${studentId}`);
      setMessage({ type: 'success', text: 'Student removed' });
      await refreshClasses();
      const res = await API.get('/classes');
      const updated = res.data.classes.find((c) => c._id === managingStudentsFor._id);
      setManagingStudentsFor(updated);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to remove student'
      });
    }
  };

  const handleDelete = async (cls) => {
    if (!window.confirm(`Delete class "${cls.className}"? This cannot be undone.`)) return;

    try {
      await API.delete(`/classes/${cls._id}`);
      setMessage({ type: 'success', text: 'Class deleted' });
      refreshClasses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Delete failed'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading classes...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Classes</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showCreateForm ? 'Cancel' : '+ New Class'}
        </button>
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

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">New Class</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Class Name (e.g., Grade 5A)"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              required
              placeholder="Grade Level (e.g., Grade 5)"
              value={form.gradeLevel}
              onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              placeholder="Section"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              required
              placeholder="Academic Year"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Create Class
          </button>
        </form>
      )}

      {/* Class list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No classes yet. Create one!
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{cls.className}</h3>
                  <p className="text-sm text-gray-500">
                    {cls.gradeLevel} - Section {cls.section}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {cls.academicYear}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">👥 Capacity: {cls.capacity}</p>
                <p className="text-sm text-gray-600">
                  🎓 Students: {cls.students?.length || 0}
                </p>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500 mb-1">HOMEROOM TEACHER</p>
                  {cls.homeroomTeacher ? (
                    <p className="text-sm font-medium text-gray-800">
                      {cls.homeroomTeacher.fullName || 'Assigned'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not assigned</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setAssigningClass(cls);
                    setSelectedTeacher(cls.homeroomTeacher?._id || '');
                    setMessage(null);
                  }}
                  className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg"
                >
                  Teacher
                </button>
                <button
                  onClick={() => {
                    setManagingStudentsFor(cls);
                    setSelectedStudent('');
                    setMessage(null);
                  }}
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg"
                >
                  Students
                </button>
                <button
                  onClick={() => handleDelete(cls)}
                  className="text-xs text-red-600 hover:text-red-800 px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign teacher modal */}
      {assigningClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Assign Teacher</h2>
              <button
                onClick={() => setAssigningClass(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Class: <span className="font-medium">{assigningClass.className}</span>
            </p>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!selectedTeacher}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2 rounded-lg"
                >
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningClass(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage students modal */}
      {managingStudentsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Students in {managingStudentsFor.className}
              </h2>
              <button
                onClick={() => setManagingStudentsFor(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Current students */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Enrolled Students ({managingStudentsFor.students?.length || 0})
              </h3>
              {managingStudentsFor.students?.length === 0 ? (
                <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                  No students enrolled yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {managingStudentsFor.students.map((s) => (
                    <li
                      key={s._id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(s._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add student */}
            <form onSubmit={handleAddStudent} className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Add Student</h3>
              <div className="flex gap-2">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">-- Choose a student --</option>
                  {students
                    .filter(
                      (s) =>
                        !managingStudentsFor.students?.some(
                          (enrolled) => enrolled._id === s._id
                        )
                    )
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName} ({s.email})
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </form>

            <button
              onClick={() => setManagingStudentsFor(null)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}