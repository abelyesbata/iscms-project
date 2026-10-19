import { useState } from 'react';

export default function AcademicRules() {
  const [message, setMessage] = useState(null);
  const [rules, setRules] = useState({
    minimumAttendance: 75,
    passMark: 60,
    maxAbsences: 15,
    gradingScale: {
      A: 90,
      B: 80,
      C: 70,
      D: 60,
      F: 0
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    // In a real system, this would POST to a backend endpoint
    // For now, just show success
    setMessage({
      type: 'success',
      text: 'Academic rules saved (locally for this session)'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Academic Rules</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure attendance thresholds and grading policies
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance Rules */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Attendance Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Attendance Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={rules.minimumAttendance}
                onChange={(e) =>
                  setRules({ ...rules, minimumAttendance: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Students below this rate will be flagged
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Absences per Term
              </label>
              <input
                type="number"
                min="0"
                value={rules.maxAbsences}
                onChange={(e) =>
                  setRules({ ...rules, maxAbsences: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                After this, students are marked as "at risk"
              </p>
            </div>
          </div>
        </section>

        {/* Grading Rules */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Grading Rules</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pass Mark (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={rules.passMark}
              onChange={(e) => setRules({ ...rules, passMark: Number(e.target.value) })}
              className="w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Boundaries
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['A', 'B', 'C', 'D', 'F'].map((grade) => (
                <div
                  key={grade}
                  className="bg-gray-50 p-3 rounded-lg text-center"
                >
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {grade}
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rules.gradingScale[grade]}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        gradingScale: {
                          ...rules.gradingScale,
                          [grade]: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full text-center px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">% minimum</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Rules */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">💰 Payment Rules</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Current payment deadlines are managed by <strong>Admins</strong> in the
              Payments page.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Base fee: Set per class by admin</li>
              <li>• 1 day late: 100 Birr penalty</li>
              <li>• 2 days late: 300 Birr penalty</li>
              <li>• 3 days late: 500 Birr penalty</li>
              <li>• 4+ days late: Payment blocked</li>
            </ul>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Save Rules
          </button>
        </div>
      </form>
    </div>
  );
}