import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function LearningHub() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const classesRes = await API.get('/classes');
        if (!cancelled) {
          const myClasses = classesRes.data.classes || [];
          setClasses(myClasses);

          // Load resources for first class
          if (myClasses.length > 0) {
            setSelectedClass(myClasses[0]._id);
            const resRes = await API.get(
              `/resources/class/${myClasses[0]._id}`
            );
            setResources(resRes.data.resources || []);
          }
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    try {
      const res = await API.get(`/resources/class/${classId}`);
      setResources(res.data.resources || []);
    } catch (err) {
      console.error(err);
      setResources([]);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await API.get(`/resources/${id}/download`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading resources...</div>;
  }

  const filtered =
    filterType === 'all'
      ? resources
      : resources.filter((r) => r.type === filterType);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Hub</h1>
        <p className="text-sm text-gray-500 mt-1">
          Download study materials shared by your teachers
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
            <option value="Note">Note</option>
            <option value="Image">Image</option>
          </select>
        </div>
      </div>

      {/* Resources */}
      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No resources yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{resourceIcon(r.type)}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  {r.type}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{r.title}</h3>
              {r.description && (
                <p className="text-sm text-gray-500 mb-2">{r.description}</p>
              )}
              <p className="text-xs text-gray-400">
                By {r.teacher?.fullName} ·{' '}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  ⬇ {r.downloads || 0} downloads
                </span>
                <button
                  onClick={() => handleDownload(r._id)}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function resourceIcon(type) {
  const icons = {
    PDF: '📄',
    Video: '🎥',
    Link: '🔗',
    Note: '📝',
    Image: '🖼️',
    Audio: '🎵',
    Other: '📦'
  };
  return icons[type] || '📄';
}