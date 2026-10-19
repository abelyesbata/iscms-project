import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'all',
    priority: 'normal',
    category: 'general',
    expiresAt: ''
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      try {
        const res = await API.get('/announcements');
        if (!cancelled) {
          setAnnouncements(res.data.announcements || []);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setForm({
      title: '',
      message: '',
      audience: 'all',
      priority: 'normal',
      category: 'general',
      expiresAt: ''
    });
    setShowForm(true);
    setMessage(null);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      message: item.message,
      audience: item.audience,
      priority: item.priority,
      category: item.category,
      expiresAt: item.expiresAt ? item.expiresAt.substring(0, 10) : ''
    });
    setShowForm(true);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const payload = { ...form };
      if (!payload.expiresAt) delete payload.expiresAt;

      if (editingItem) {
        await API.put(`/announcements/${editingItem._id}`, payload);
        setMessage({ type: 'success', text: 'Announcement updated' });
      } else {
        await API.post('/announcements', payload);
        setMessage({ type: 'success', text: 'Announcement published' });
      }

      setShowForm(false);
      setEditingItem(null);
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete announcement "${item.title}"?`)) return;

    try {
      await API.delete(`/announcements/${item._id}`);
      setMessage({ type: 'success', text: 'Announcement deleted' });
      refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Delete failed'
      });
    }
  };

  const toggleActive = async (item) => {
    try {
      await API.put(`/announcements/${item._id}`, {
        isActive: !item.isActive
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast messages to students, teachers, and parents
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          + New Announcement
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
          No announcements yet. Click "New Announcement" to publish one.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a._id}
              announcement={a}
              onEdit={() => openEditForm(a)}
              onDelete={() => handleDelete(a)}
              onToggleActive={() => toggleActive(a)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., School Closed for Holiday"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audience
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Everyone</option>
                    <option value="students">Students only</option>
                    <option value="teachers">Teachers only</option>
                    <option value="parents">Parents only</option>
                    <option value="staff">Staff only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="general">General</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires On (optional)
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                >
                  {editingItem ? 'Update' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ announcement, onEdit, onDelete, onToggleActive }) {
  const a = announcement;

  const priorityColors = {
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const categoryIcons = {
    general: '📢',
    holiday: '🎉',
    exam: '📝',
    meeting: '👥',
    event: '🎊',
    urgent: '🚨'
  };

  return (
    <div
      className={`bg-white rounded-lg shadow border-l-4 ${
        a.priority === 'urgent'
          ? 'border-l-red-500'
          : a.priority === 'high'
          ? 'border-l-yellow-500'
          : 'border-l-blue-500'
      } ${!a.isActive ? 'opacity-60' : ''}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{categoryIcons[a.category] || '📢'}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`px-2 py-0.5 rounded border ${priorityColors[a.priority]}`}>
                  {a.priority}
                </span>
                <span className="text-gray-500">for {a.audience}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{a.category}</span>
                {!a.isActive && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    INACTIVE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{a.message}</p>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            By {a.publishedBy?.fullName || 'Admin'} ·{' '}
            {new Date(a.createdAt).toLocaleDateString()}
            {a.expiresAt && (
              <> · Expires {new Date(a.expiresAt).toLocaleDateString()}</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleActive}
              className="text-xs text-gray-600 hover:underline"
            >
              {a.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={onDelete} className="text-xs text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}