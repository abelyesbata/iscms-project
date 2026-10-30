import { useEffect, useState, useRef } from 'react';
import API from '../../services/api';
import { useLanguage } from '../../context/useLanguage'; // 👈 ተጨምሯል

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
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const { t } = useLanguage(); // 👈 ተጨምሯል

  const [form, setForm] = useState({
    className: '',
    gradeLevel: '',
    section: 'A',
    academicYear: '2025/2026',
    capacity: 30
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchQuery('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setMessage({ type: 'success', text: t('successClassCreated') || 'Class created successfully' });
      setShowCreateForm(false);
      setForm({ className: '', gradeLevel: '', section: 'A', academicYear: '2025/2026', capacity: 30 });
      refreshClasses();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('errorClassCreate') || 'Failed to create class' });
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setMessage({ type: 'error', text: t('errorSelectTeacher') || 'Please select a teacher' });
      return;
    }

    try {
      await API.put(`/classes/${assigningClass._id}`, { homeroomTeacher: selectedTeacher });
      setMessage({ type: 'success', text: t('successTeacherAssigned') || 'Teacher assigned successfully' });
      setAssigningClass(null);
      setSelectedTeacher('');
      setSearchQuery('');
      refreshClasses();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('errorAssignment') || 'Assignment failed' });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setMessage({ type: 'error', text: t('errorSelectStudent') || 'Please select a student' });
      return;
    }

    try {
      await API.post(`/classes/${managingStudentsFor._id}/students`, { studentId: selectedStudent });
      setMessage({ type: 'success', text: t('successStudentAdded') || 'Student added successfully' });
      setSelectedStudent('');
      setSearchQuery('');
      await refreshClasses();
      
      const res = await API.get('/classes');
      const updated = res.data.classes.find((c) => c._id === managingStudentsFor._id);
      setManagingStudentsFor(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('errorAddStudent') || 'Failed to add student' });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm(t('confirmRemoveStudent') || 'Remove this student from the class?')) return;
    try {
      await API.delete(`/classes/${managingStudentsFor._id}/students/${studentId}`);
      setMessage({ type: 'success', text: t('successStudentRemoved') || 'Student removed' });
      await refreshClasses();
      const res = await API.get('/classes');
      const updated = res.data.classes.find((c) => c._id === managingStudentsFor._id);
      setManagingStudentsFor(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('errorRemoveStudent') || 'Failed to remove student' });
    }
  };

  const handleDelete = async (cls) => {
    if (!window.confirm(t('confirmDeleteClass') || `Delete class "${cls.className}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/classes/${cls._id}`);
      setMessage({ type: 'success', text: t('successClassDeleted') || 'Class deleted' });
      refreshClasses();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('errorDeleteClass') || 'Delete failed' });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t('loading')}</div>;
  }

  const filteredTeachers = teachers.filter(t => 
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    !managingStudentsFor?.students?.some(enrolled => enrolled._id === s._id) &&
    (s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">{t('manageClasses')}</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showCreateForm ? t('cancel') : t('newClass')}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{t('newClass')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder={t('className')} value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input required placeholder={t('gradeLevel')} value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input placeholder={t('section')} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input required placeholder={t('academicYear')} value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="px-3 py-2 border rounded-lg" />
            <input type="number" placeholder={t('capacity')} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="px-3 py-2 border rounded-lg" />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">{t('createClass')}</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">{t('noClasses')}</div>
        ) : (
          classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{cls.className}</h3>
                  <p className="text-sm text-gray-500">{cls.gradeLevel} - {t('section')} {cls.section}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">{cls.academicYear}</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">👥 {t('capacity')}: {cls.capacity}</p>
                <p className="text-sm text-gray-600">🎓 {t('students')}: {cls.students?.length || 0}</p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('homeroomTeacher')}</p>
                  {cls.homeroomTeacher ? (
                    <p className="text-sm font-medium text-gray-800">{cls.homeroomTeacher.fullName || t('assigned')}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">{t('notAssigned')}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setAssigningClass(cls);
                    setSelectedTeacher(cls.homeroomTeacher?._id || '');
                    setSearchQuery('');
                    setMessage(null);
                  }}
                  className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg"
                >
                  {t('teacher')}
                </button>
                <button
                  onClick={() => {
                    setManagingStudentsFor(cls);
                    setSelectedStudent('');
                    setSearchQuery('');
                    setMessage(null);
                  }}
                  className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg"
                >
                  {t('students')}
                </button>
                <button onClick={() => handleDelete(cls)} className="text-xs text-red-600 hover:text-red-800 px-2">{t('delete')}</button>
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
              <h2 className="text-xl font-bold text-gray-800">{t('assignTeacher')}</h2>
              <button onClick={() => setAssigningClass(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t('class')}: <span className="font-medium">{assigningClass.className}</span></p>
            
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectTeacher')}</label>
                <input
                  type="text"
                  placeholder={t('searchTeacher')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="max-h-48 overflow-y-auto border rounded-lg bg-gray-50">
                  {filteredTeachers.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500 text-center">{t('noTeachersFound')}</p>
                  ) : (
                    filteredTeachers.map(t => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTeacher(t._id)}
                        className={`p-3 border-b cursor-pointer text-sm transition-colors ${
                          selectedTeacher === t._id ? 'bg-indigo-100 border-indigo-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-800">{t.fullName}</div>
                        <div className="text-xs text-gray-500">{t.email}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={!selectedTeacher} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2 rounded-lg">{t('assign')}</button>
                <button type="button" onClick={() => setAssigningClass(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">{t('cancel')}</button>
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
              <h2 className="text-xl font-bold text-gray-800">{t('studentsIn')} {managingStudentsFor.className}</h2>
              <button onClick={() => setManagingStudentsFor(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('enrolledStudents')} ({managingStudentsFor.students?.length || 0})</h3>
              {managingStudentsFor.students?.length === 0 ? (
                <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">{t('noStudentsEnrolled')}</p>
              ) : (
                <ul className="space-y-2">
                  {managingStudentsFor.students.map((s) => (
                    <li key={s._id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="text-sm font-medium">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                      <button onClick={() => handleRemoveStudent(s._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">{t('remove')}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleAddStudent} className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">{t('addStudent')}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectStudent')}</label>
                <input
                  type="text"
                  placeholder={t('searchStudent')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <div className="max-h-48 overflow-y-auto border rounded-lg bg-gray-50">
                  {filteredStudents.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500 text-center">{t('noStudentsFound')}</p>
                  ) : (
                    filteredStudents.map(s => (
                      <div
                        key={s._id}
                        onClick={() => setSelectedStudent(s._id)}
                        className={`p-3 border-b cursor-pointer text-sm transition-colors ${
                          selectedStudent === s._id ? 'bg-green-100 border-green-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-800">{s.fullName}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={!selectedStudent} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 rounded-lg">{t('addStudent')}</button>
                <button type="button" onClick={() => setManagingStudentsFor(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">{t('close')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}