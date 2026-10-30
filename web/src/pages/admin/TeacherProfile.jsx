import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';

export default function TeacherProfile() {
  const { id } = useParams(); 
  
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setTeacher(res.data);
      } catch (err) {
        console.error(err);
        setError('የመምህሩን መረጃ ማምጣት አልተቻለም።');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">በመጫን ላይ...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!teacher) return <div className="p-8 text-center text-slate-500">መምህሩ አልተገኘም።</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/admin/teachers" 
        className="inline-flex mb-6 text-indigo-600 hover:text-indigo-800 items-center gap-2 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        ወደ መምህራን ዝርዝር ተመለስ
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header / Cover (ለየት ያለ ቀለም) */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold uppercase">
                {teacher.name ? teacher.name.charAt(0) : 'T'}
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-2">
              ንቁ (Active)
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">{teacher.name || 'ስም አልተመዘገበም'}</h1>
            <p className="text-slate-500 mt-1">{teacher.email}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">ልዩ ሙያ (Subject)</p>
              <p className="font-semibold text-slate-800 text-lg">{teacher.subject || 'አልተመዘገበም'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">ሮል (Role)</p>
              <p className="font-semibold text-slate-800 capitalize text-lg">{teacher.role}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">ስልክ ቁጥር (Phone)</p>
              <p className="font-semibold text-slate-800 text-lg">{teacher.phone || 'አልተመዘገበም'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">የተቀጠረበት ቀን (Joined)</p>
              <p className="font-semibold text-slate-800 text-lg">
                {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}