import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function MakePayment() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 1. Fetch children linked to this parent
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

  // 2. Fetch payment status for the selected child
  useEffect(() => {
    if (!selectedChild) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await API.get(`/payments/status/${selectedChild._id}`);
        if (!cancelled) {
          setStatus(res.data);
          setMessage(null);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus(null);
          setMessage({
            type: 'error',
            text: err.response?.data?.message || 'Unable to fetch payment status'
          });
        }
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [selectedChild]);

  // 3. Handle Chapa Payment Initiation
  const handleChapaPay = async () => {
    setProcessing(true);
    setMessage(null);

    try {
      // Call backend to generate Chapa checkout URL
      const res = await API.post('/payments/chapa/initiate', {
        studentId: selectedChild._id
      });

      // Redirect the parent to Chapa's hosted checkout page
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Payment initiation failed'
      });
      setProcessing(false);
    }
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Make Payment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pay school fees for your child securely via Chapa
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

      {status && status.status === 'paid' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-bold text-lg">✅ Already Paid</p>
          <p className="text-sm text-green-700 mt-2">
            Receipt: {status.payment?.receiptNumber}
          </p>
        </div>
      )}

      {status && status.status === 'blocked' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-bold text-lg">🚫 Payment Blocked</p>
          <p className="text-sm text-red-700 mt-2">
            You are {status.daysLate} days late. Please contact the school admin.
          </p>
        </div>
      )}

      {status && status.status !== 'paid' && status.status !== 'blocked' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Details</h2>

          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <dt className="text-gray-600">Period</dt>
              <dd className="font-medium">{status.periodLabel || '—'}</dd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <dt className="text-gray-600">Base Amount</dt>
              <dd className="font-medium">{status.baseAmount} Birr</dd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <dt className="text-gray-600">Days Late</dt>
              <dd className={`font-medium ${status.daysLate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {status.daysLate > 0 ? `${status.daysLate} day(s)` : 'On time'}
              </dd>
            </div>
            {status.penalty > 0 && (
              <div className="flex justify-between py-2 border-b">
                <dt className="text-gray-600">Penalty</dt>
                <dd className="font-medium text-red-600">+{status.penalty} Birr</dd>
              </div>
            )}
            <div className="flex justify-between py-3 bg-gray-50 px-3 rounded">
              <dt className="font-bold text-gray-800">Total Due</dt>
              <dd className="font-bold text-xl text-indigo-600">
                {status.totalAmount} Birr
              </dd>
            </div>
          </dl>

          {/* Chapa Payment Button */}
          <button
            onClick={handleChapaPay}
            disabled={processing}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition"
          >
            {processing ? 'Redirecting to Chapa...' : `Pay ${status.totalAmount} Birr with Chapa`}
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-2">
            Secure payment powered by Chapa. You will be redirected.
          </p>
        </div>
      )}

      {!status && !message && (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No active payment period for your child's class.
        </div>
      )}
    </div>
  );
}