import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <div className="w-12 h-12 bg-green-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
            🎓
          </div>
          <h2 className="text-center text-sm font-bold mt-2">Wachemo University</h2>
          <p className="text-center text-xs text-gray-500">Student Portal</p>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <SidebarLink to="/student" icon="📊" active={location.pathname === '/student'}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/student/grades" icon="📝" active={location.pathname === '/student/grades'}>
            My Grades
          </SidebarLink>
          <SidebarLink to="/student/attendance" icon="📅" active={location.pathname === '/student/attendance'}>
            My Attendance
          </SidebarLink>
          <SidebarLink to="/student/resources" icon="📚" active={location.pathname === '/student/resources'}>
            Learning Hub
          </SidebarLink>
          <SidebarLink to="/student/notifications" icon="📢" active={location.pathname === '/student/notifications'}>
            Notifications
          </SidebarLink>
        </nav>

        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 mb-2">{user?.email}</div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-sm bg-green-500 hover:bg-green-600 text-white py-2 rounded mb-2"
          >
            🔐 Change Password
          </button>
          <button
            onClick={logout}
            className="w-full text-sm bg-red-500 hover:bg-red-600 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500">Student Portal — ISCMS</p>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function SidebarLink({ to, icon, children, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}