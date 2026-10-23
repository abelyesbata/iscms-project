import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // ለሞባይል ሜኑ መክፈቻና መዝጊያ State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      
      {/* 1. Mobile Backdrop (ሜኑ ሲከፈት የኋላ በኩል ጨለማ ያደርጋል) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 2. Sidebar (በሞባይል ላይ ተንሳፋፊ ሆኖ ይታያል) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
              <img 
                src="/wachemo-school.jpg" 
                alt="Wachemo School" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-sm font-bold mt-2">Wachemo University</h2>
            <p className="text-xs text-gray-500">ISCMS Admin</p>
          </div>
          {/* በሞባይል ላይ ሜኑን ለመዝጋት (X) አዶ */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {/* ሜኑ ሲነካ በራሱ እንዲዘጋ ለማድረግ onClick ተጨምሯል */}
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <SidebarLink to="/admin" icon="📊" active={location.pathname === '/admin'}>
              Dashboard
            </SidebarLink>
            <SidebarLink to="/admin/users" icon="👥" active={location.pathname === '/admin/users'}>
              Manage Users
            </SidebarLink>
            <SidebarLink to="/admin/classes" icon="🏫" active={location.pathname === '/admin/classes'}>
              Manage Classes
            </SidebarLink>
            <SidebarLink to="/admin/reports" icon="📈" active={location.pathname === '/admin/reports'}>
              Reports
            </SidebarLink>
            <SidebarLink to="/admin/payments" icon="💰" active={location.pathname === '/admin/payments'}>
              Payments
            </SidebarLink>
            <SidebarLink to="/admin/announcements" icon="📢" active={location.pathname === '/admin/announcements'}>
              Announcements
            </SidebarLink>
            <SidebarLink to="/admin/settings" icon="⚙️" active={location.pathname === '/admin/settings'}>
              Settings
            </SidebarLink>
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 mb-2 truncate">{user?.email}</div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-sm bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded mb-2"
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

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ሞባይል ላይ ብቻ የሚታየው የሜኑ አዶ (☰) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Welcome, {user?.name}</h1>
              <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Integrated School Community Management</p>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-6 flex-1 overflow-auto">
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 ${
        active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}