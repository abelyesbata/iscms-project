import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // Timeout ጨምሯል (10 ሰከንድ)
      const res = await API.post('/auth/forgot-password', { email }, { timeout: 10000 });
      
      setMessage({ type: 'success', text: res.data.message });
      setEmail('');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setMessage({ type: 'error', text: 'Request timed out. Please try again.' });
      } else {
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to send email'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/login"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}