import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [finance, setFinance] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [overdueData, setOverdueData] = useState(null);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    classroomId: '',
    currentDueDate: '',
    periodLabel: '',
    baseAmount: 500,
    penaltyRules: { 1: 100, 2: 300, 3: 500 },
    blockAfterDays: 4
  });

  // Initial load
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [classesRes, financeRes] = await Promise.all([
          API.get('/classes'),
          API.get('/reports/finance/summary')
        ]);

        if (!cancelled) {
          setClasses(classesRes.data.classes || []);
          setFinance(financeRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({
            type: 'error',
            text: err.response?.data?.message || 'Failed to load data'
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshFinance = async () => {
    try {
      const res = await API.get('/reports/finance/summary');
      setFinance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOverdue = async (classId) => {
    try {
      const res = await API.get(`/payments/overdue/${classId}`);
      setOverdueData(res.data);
    } catch (err) {
      setOverdueData(null);
      console.error(err);
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await API.post('/payments/set-deadline', form);
      setMessage({ type: 'success', text: 'Payment deadline set successfully' });
      setShowDeadlineForm(false);
      setForm({
        classroomId: '',
        currentDueDate: '',
        periodLabel: '',
        baseAmount: 500,
        penaltyRules: { 1: 100, 2: 300, 3: 500 },
        blockAfterDays: 4
      });
      refreshFinance();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to set deadline'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage payment deadlines, view collections, and track overdue students
          </p>
        </div>
        <button
          onClick={() => setShowDeadlineForm(!showDeadlineForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showDeadlineForm ? 'Cancel' : '+ Set Deadline'}
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

      {/* Set Deadline Form */}
      {showDeadlineForm && (
        <form
          onSubmit={handleSetDeadline}
          className="bg-white p-6 rounded-lg shadow mb-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-2">Set Payment Deadline</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                required
                value={form.classroomId}
                onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                Period Label
              </label>
              <input
                required
                type="text"
                placeholder="e.g., October 2026"
                value={form.periodLabel}
                onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                required
                type="date"
                value={form.currentDueDate}
                onChange={(e) => setForm({ ...form, currentDueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Amount (Birr)
              </label>
              <input
                required
                type="number"
                value={form.baseAmount}
                onChange={(e) => setForm({ ...form, baseAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Penalty Rules (Fixed for ISCMS)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">1 day late</div>
                <div className="text-lg font-bold text-red-600">100 Birr</div>
              </div>
              <div className="text-center bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">2 days late</div>
                <div className="text-lg font-bold text-red-600">300 Birr</div>
              </div>
              <div className="text-center bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">3 days late</div>
                <div className="text-lg font-bold text-red-600">500 Birr</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-red-600 bg-red-50 p-2 rounded">
              ⚠️ After 4 days late → Payment is BLOCKED
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Save Deadline
          </button>
        </form>
      )}

      {/* Finance Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">💰 Finance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FinanceCard
            title="Total Collected"
            value={`${finance?.summary?.totalPaid || 0} Birr`}
            color="emerald"
          />
          <FinanceCard
            title="Paid"
            value={finance?.summary?.paidCount || 0}
            color="green"
          />
          <FinanceCard
            title="Pending"
            value={finance?.summary?.pendingCount || 0}
            color="yellow"
          />
          <FinanceCard
            title="Penalties"
            value={`${finance?.summary?.totalPenalties || 0} Birr`}
            color="red"
          />
        </div>
      </section>

      {/* Overdue Tracker */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">⚠️ Overdue Students</h2>

        <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              if (e.target.value) loadOverdue(e.target.value);
              else setOverdueData(null);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">-- Choose class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        {overdueData && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {overdueData.daysLate === 0 ? (
              <div className="p-6 text-center text-green-600 font-medium">
                ✅ No overdue students — everyone paid on time!
              </div>
            ) : overdueData.count === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No overdue students for this class.
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                  <span className="text-sm font-medium text-yellow-800">
                    {overdueData.count} student(s) overdue by {overdueData.daysLate} day(s)
                  </span>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Days Late
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Penalty
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueData.overdueStudents.map((s) => (
                      <tr key={s.student.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-800">
                            {s.student.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.student.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {s.daysLate}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {s.blocked ? '—' : `${s.penalty} Birr`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.blocked ? (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                              Overdue
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {!overdueData && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            Select a class above to see overdue students.
          </div>
        )}
      </section>
    </div>
  );
}

function FinanceCard({ title, value, color }) {
  const colors = {
    emerald: 'border-l-emerald-500',
    green: 'border-l-green-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500'
  };

  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${colors[color]}`}>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value ?? 0}</div>
    </div>
  );
}