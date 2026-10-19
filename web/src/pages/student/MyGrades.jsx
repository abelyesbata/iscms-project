import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function MyGrades() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, Term 1, Term 2, Term 3

  useEffect(() => {
    let cancelled = false;

    const fetchGrades = async () => {
      try {
        const res = await API.get(`/grades/student/${user.id}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error('Failed to load grades:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGrades();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading grades...</div>;
  }

  const marks = data?.marks || [];
  const filtered =
    filter === 'all' ? marks : marks.filter((m) => m.term === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your complete academic record
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="all">All Terms</option>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
      </div>

      {/* Subject summary */}
      {data?.subjectSummary && data.subjectSummary.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">📊 Subject Averages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.subjectSummary.map((s) => (
              <div key={s.subject} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{s.subject}</h3>
                  <GradeBadge grade={letterGrade(s.average)} />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {s.average}%
                </p>
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
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          📝 All Assessments
        </h2>
        {filtered.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No marks found.
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
                    Assessment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Term
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const percentage = m.maxScore
                    ? Math.round((m.score / m.maxScore) * 100)
                    : 0;

                  return (
                    <tr key={m._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {m.subject}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">
                        {m.assessmentType}
                        {m.assessmentName && ` — ${m.assessmentName}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {m.term}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {m.score} / {m.maxScore}
                        <span className="text-gray-400 ml-1">({percentage}%)</span>
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