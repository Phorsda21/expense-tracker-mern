import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import SideMenu from './SideMenu';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <SideMenu />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
