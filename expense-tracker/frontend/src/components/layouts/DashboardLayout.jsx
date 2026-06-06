import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import SideMenu from './SideMenu';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen bg-[#0b0f1a] flex overflow-hidden">
      <SideMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen lg:pl-72 transition-all duration-300 overflow-y-auto">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;