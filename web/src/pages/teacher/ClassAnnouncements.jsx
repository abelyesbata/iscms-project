import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function ClassAnnouncements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    category: 'general',
    classroomId: ''
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [classesRes, annRes] = await Promise.all([
          API.get('/classes').catch(() => ({ data: { classes: [] } })),
          API.get('/announcements').catch(() => ({ data: { announcements: [] } }))
        ]);

        if (!cancelled) {
          const myClasses = (classesRes.data.classes || []).filter(
            (c) => c.homeroomTeacher?._id === user.id
          );
          setClasses(myClasses);

          // Filter announcements to those made by this teacher (or all)
          const all = annRes.data.announcements || [];
          setAnnouncements(all);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const refresh = async () => {
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Include selected class info in the message
      const selectedClass = classes.find((c) => c._id === form.classroomId);
      const messageText = selectedClass
        ? `[${selectedClass.className}] ${form.message}`
        : form.message;

      await API.post('/announcements', {
        title: form.title,
        message: messageText,
        priority: form.priority,
        category: form.category,
        audience: 'all'
      });

      setMessage({ type: 'success', text: 'Announcement sent' });
      setForm({
        title: '',
        message: '',
        priority: 'normal',
        category: 'general',
        classroomId: ''
      });
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      setMessage({ type: 'success', text: 'Deleted' });
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send messages to your students and their parents
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Send New Announcement</h2>

          {/* Class selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class (optional)
            </label>
            <select
              value={form.classroomId}
              onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- All my classes --</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                You are not assigned to any class yet.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Math Test Next Week"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              required
              rows="4"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your message..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg"
          >
            {saving ? 'Sending...' : 'Send Announcement'}
          </button>
        </form>

        {/* Recent announcements */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Announcements</h2>
          {announcements.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              No announcements yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-auto">
              {announcements.slice(0, 10).map((a) => (
                <div key={a._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-800">{a.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        a.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : a.priority === 'high'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {a.message}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      By {a.publishedBy?.fullName} ·{' '}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                    {a.publishedBy?._id === user.id && (
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}