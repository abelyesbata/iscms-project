import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function ChildGrades() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [data, setData] = useState(null);

  // Fetch children once
  useEffect(() => {
    let cancelled = false;

    const fetchChildren = async () => {
      try {
        const res = await API.get('/auth/my-children');
        if (!cancelled) {
          const kids = res.data.children || [];
          setChildren(kids);
          if (kids.length > 0) setSelectedChild(kids[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChildren();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch selected child's grades
  useEffect(() => {
    if (!selectedChild) return;

    let cancelled = false;

    const fetchGrades = async () => {
      try {
        const res = await API.get(`/grades/student/${selectedChild._id}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGrades();
    return () => {
      cancelled = true;
    };
  }, [selectedChild]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">No children linked to your account.</p>
      </div>
    );
  }

  const marks = data?.marks || [];
  const subjectSummary = data?.subjectSummary || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Child's Grades</h1>
          <p className="text-sm text-gray-500 mt-1">
            Academic performance overview
          </p>
        </div>

        {children.length > 1 && (
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
        )}
      </div>

      {/* Subject averages */}
      {subjectSummary.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">📊 Subject Averages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjectSummary.map((s) => (
              <div key={s.subject} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{s.subject}</h3>
                  <GradeBadge grade={letterGrade(s.average)} />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{s.average}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {s.markCount} assessment(s)
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All marks */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">📝 All Assessments</h2>
        {marks.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No grades recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assessment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => {
                  const percentage = m.maxScore
                    ? Math.round((m.score / m.maxScore) * 100)
                    : 0;
                  return (
                    <tr key={m._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{m.subject}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">{m.assessmentType}</td>
                      <td className="px-4 py-3 text-sm text-center">{m.term}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {m.score}/{m.maxScore} <span className="text-gray-400">({percentage}%)</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={letterGrade(percentage)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
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