import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [data, setData] = useState(null);

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

  useEffect(() => {
    if (!selectedChild) return;

    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const res = await API.get(`/payments/student/${selectedChild._id}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
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

  const payments = data?.payments || [];
  const summary = data?.summary || {};

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">
            All payment records
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Paid" value={`${summary.totalPaid || 0} Birr`} color="bg-emerald-500" />
        <SummaryCard label="Penalties" value={`${summary.totalPenalty || 0} Birr`} color="bg-red-500" />
        <SummaryCard label="Paid Count" value={summary.paidCount || 0} color="bg-green-500" />
        <SummaryCard label="Pending" value={summary.pendingCount || 0} color="bg-yellow-500" />
      </div>

      {/* Payments */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">📜 Payment Records</h2>
        {payments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No payment records yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Penalty</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.periodLabel}</td>
                    <td className="px-4 py-3 text-sm text-center">{p.amount} Birr</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">
                      {p.penalty > 0 ? `+${p.penalty}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold">{p.totalAmount} Birr</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className={`w-10 h-10 ${color} rounded-lg mb-3`}></div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-orange-100 text-orange-800',
    blocked: 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded capitalize ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}