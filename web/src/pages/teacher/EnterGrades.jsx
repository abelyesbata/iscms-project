import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function EnterGrades() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState({
    subject: 'Mathematics',
    term: 'Term 1',
    academicYear: '2025/2026',
    assessmentType: 'Final',
    maxScore: 100
  });

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
    const cls = classes.find((c) => c._id === classId);
    setStudents(cls?.students || []);
    setScores({});
    setMessage(null);
  };

  const handleScoreChange = (studentId, value) => {
    setScores({ ...scores, [studentId]: value });
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
      const records = students
        .filter((s) => scores[s._id] !== undefined && scores[s._id] !== '')
        .map((s) => ({
          studentId: s._id,
          score: Number(scores[s._id])
        }));

      if (records.length === 0) {
        setMessage({ type: 'error', text: 'Please enter at least one score' });
        setSaving(false);
        return;
      }

      const res = await API.post('/grades/entry-bulk', {
        classroomId: selectedClass,
        subject: meta.subject,
        term: meta.term,
        academicYear: meta.academicYear,
        assessmentType: meta.assessmentType,
        maxScore: Number(meta.maxScore),
        records
      });

      setMessage({
        type: 'success',
        text: res.data.message || 'Grades saved successfully'
      });
      setScores({});
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save grades'
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
        <h1 className="text-2xl font-bold text-gray-800">Enter Grades</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record exam and assignment scores for your students
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

      <form onSubmit={handleSubmit}>
        {/* Meta info */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              required
              value={selectedClass}
              onChange={(e) => handleClassSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Select class --</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              required
              type="text"
              value={meta.subject}
              onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Type
            </label>
            <select
              value={meta.assessmentType}
              onChange={(e) => setMeta({ ...meta, assessmentType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <select
              value={meta.term}
              onChange={(e) => setMeta({ ...meta, term: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              required
              type="text"
              value={meta.academicYear}
              onChange={(e) => setMeta({ ...meta, academicYear: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Score
            </label>
            <input
              required
              type="number"
              value={meta.maxScore}
              onChange={(e) => setMeta({ ...meta, maxScore: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Student scores */}
        {students.length > 0 && (
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Score (out of {meta.maxScore})
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
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max={meta.maxScore}
                        value={scores[s._id] ?? ''}
                        onChange={(e) => handleScoreChange(s._id, e.target.value)}
                        placeholder="—"
                        className="w-24 text-center px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            This class has no students yet.
          </div>
        )}
      </form>
    </div>
  );
}