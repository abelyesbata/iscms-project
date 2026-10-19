import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import API from '../../services/api';

export default function Settings() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);

  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initial load
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [meRes, usersRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/auth/users')
        ]);
        if (!cancelled) {
          setForm((f) => ({
            ...f,
            fullName: meRes.data.user.fullName,
            email: meRes.data.user.email
          }));

          const users = usersRes.data.users || [];
          setStats({
            total: users.length,
            admins: users.filter((u) => u.role === 'admin').length,
            teachers: users.filter((u) => u.role === 'teacher').length,
            students: users.filter((u) => u.role === 'student').length,
            parents: users.filter((u) => u.role === 'parent').length,
            registrars: users.filter((u) => u.role === 'registrar').length
          });
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({
            type: 'error',
            text: err.response?.data?.message || 'Failed to load settings'
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email
      };

      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (form.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        payload.password = form.newPassword;
      }

      const res = await API.put(`/auth/users/${user.id}`, payload);

      const updatedUser = {
        ...user,
        name: res.data.user.fullName,
        email: res.data.user.email
      };
      const token = localStorage.getItem('token');
      login(updatedUser, token);

      setForm((f) => ({
        ...f,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Update failed'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and system preferences
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile form */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👤 My Profile</h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Change Password (leave blank to keep current)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={form.newPassword}
                        onChange={(e) =>
                          setForm({ ...form, newPassword: e.target.value })
                        }
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 px-1"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 px-1"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password match indicator */}
                {form.newPassword && form.confirmPassword && (
                  <div className="mt-3 text-sm">
                    {form.newPassword === form.confirmPassword ? (
                      <span className="text-green-600">
                        ✅ Passwords match
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ❌ Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* School info */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏫 School Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">School Name</dt>
                <dd className="font-medium text-gray-800">
                  Wachemo Community Excellency School
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium text-gray-800">
                  Hossana, Hadiya Zone, Ethiopia
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">System Name</dt>
                <dd className="font-medium text-gray-800">
                  Integrated School Community Management System (ISCMS)
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Academic Year</dt>
                <dd className="font-medium text-gray-800">2025/2026</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ System Status</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Backend</span>
                <span className="text-green-600 font-medium">● Online</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">● Connected</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">API Version</span>
                <span className="text-gray-800">v1.0.0</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">System Version</span>
                <span className="text-gray-800">ISCMS 2026.10</span>
              </li>
            </ul>
          </section>

          {/* Users summary */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Users Overview</h2>
            {stats && (
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-gray-800">{stats.total}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Admins</span>
                  <span className="text-purple-600 font-medium">{stats.admins}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Teachers</span>
                  <span className="text-blue-600 font-medium">{stats.teachers}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="text-green-600 font-medium">{stats.students}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Parents</span>
                  <span className="text-orange-600 font-medium">{stats.parents}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Registrars</span>
                  <span className="text-indigo-600 font-medium">{stats.registrars}</span>
                </li>
              </ul>
            )}
          </section>

          {/* Danger zone */}
          <section className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
            <h2 className="text-lg font-bold text-red-800 mb-2">⚠️ Danger Zone</h2>
            <p className="text-sm text-red-700 mb-4">
              Actions here cannot be undone. Only use if you're sure.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Logout from all devices? You will need to login again.')) {
                  localStorage.clear();
                  window.location.href = '/login';
                }
              }}
              className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            >
              Logout from all devices
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}