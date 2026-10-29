import { useState, useEffect } from 'react';
import API from '../../services/api'; // የ API ፋይልህ ትክክለኛ መንገድ አረጋግጥ

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ተማሪዎችን ከባክኤንድ ማምጣት
    const fetchStudents = async () => {
      try {
        // እባክህ ይህንን መንገድ በትክክለኛው የባክኤንድ ሮውትህ (Endpoint) ቀይረው
        const res = await API.get('/users?role=student'); 
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
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
          <h1 className="text-2xl font-bold text-slate-800">የተማሪዎች ዝርዝር</h1>
          <p className="text-sm text-slate-500">በትምህርት ቤቱ የተመዘገቡ ተማሪዎችን እዚህ ማየት ይችላሉ።</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-semibold">ስም (Name)</th>
                <th className="p-4 font-semibold">ኢሜይል (Email)</th>
                <th className="p-4 font-semibold">ክፍል (Class)</th>
                <th className="p-4 font-semibold">ሁኔታ (Status)</th>
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
                        <span className="font-medium text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{student.email}</td>
                    <td className="p-4 text-slate-600">{student.className || 'አልተመደበም'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ንቁ (Active)
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
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