import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const verify = async () => {
      const txRef = searchParams.get('tx_ref');
      if (!txRef) {
        setStatus('error');
        setMessage('No transaction reference found');
        return;
      }

      try {
        const res = await API.get(`/payments/chapa/verify/${txRef}`);
        setStatus('success');
        setMessage(`Payment successful! Receipt: ${res.data.receiptNumber}`);

        setTimeout(() => navigate('/parent/history'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment verification failed');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-800">Verifying...</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecting to history...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate('/parent/payments')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}