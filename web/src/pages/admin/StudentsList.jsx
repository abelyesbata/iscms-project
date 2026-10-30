import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useLanguage } from '../../context/useLanguage';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage(); 

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get('/users?role=student'); 
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError('ተማሪዎችን ማምጣት አልተቻለም። እባክህ የኤፒአይ አድራሻውን አረጋግጥ።');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('studentsList')}</h1>
          <p className="text-sm text-slate-500">በትምህርት ቤቱ የተመዘገቡ ተማሪዎችን እዚህ ማየት ይችላሉ።</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold">{t('name')}</th>
                <th className="p-4 font-semibold">{t('email')}</th>
                <th className="p-4 font-semibold">{t('class')}</th>
                <th className="p-4 font-semibold">{t('status')}</th>
                <th className="p-4 font-semibold text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="font-medium text-slate-800">{student.name || t('notRecorded')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{student.email}</td>
                    <td className="p-4 text-slate-600">{student.className || t('notAssigned')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {t('active')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/students/${student._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                        {t('viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    ምንም ተማሪ አልተገኘም።
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}