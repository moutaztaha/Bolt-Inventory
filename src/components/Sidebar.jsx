import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
  Building,
  Shield,
  BarChart3,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [userManagementOpen, setUserManagementOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/requisitions', icon: FileText, label: 'Requisitions' },
  ];

  // User Management sub-items (only for admin users)
  const userManagementItems = [
    { to: '/users', icon: User, label: 'Users' },
    { to: '/departments', icon: Building, label: 'Departments' },
    { to: '/permissions', icon: Shield, label: 'Permissions' },
    { to: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
  ];

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 SIDEBAR DEBUG:');
    console.log('- User object:', user);
    console.log('- User role:', user?.role);
    console.log('- Is admin?:', user?.role === 'admin');
    console.log('- Should show User Management?:', user?.role === 'admin');
  }, [user]);

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="bg-white shadow-lg w-64 min-w-64">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo Container */}
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ minHeight: '96px', minWidth: '96px' }}
          >
            <img 
              src="/logo.webp" 
              alt="Factory Management System" 
              className="w-full h-full object-contain"
              onLoad={(e) => {
                console.log('✅ SIDEBAR LOGO LOADED: Image element loaded successfully');
              }}
              onError={(e) => {
                console.log('❌ SIDEBAR LOGO ERROR: Image element failed to load');
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            
            {/* Fallback Logo */}
            <div 
              className="w-24 h-24 bg-primary-500 text-white text-2xl font-bold rounded-lg flex items-center justify-center"
              style={{ display: 'none' }}
            >
              FMS
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Factory Management</h1>
            <p className="text-sm text-gray-600">System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {/* Main Navigation Items */}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group ${
                isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' : ''
              }`
            }
          >
            <Icon className="h-5 w-5 mr-3" />
            <span className="font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        {/* User Management Section - ALWAYS SHOW FOR TESTING */}
        <div>
          <button
            onClick={() => setUserManagementOpen(!userManagementOpen)}
            className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
          >
            <Users className="h-5 w-5 mr-3" />
            <span className="font-medium">User Management</span>
            {userManagementOpen ? (
              <ChevronDown className="h-4 w-4 ml-auto transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto transition-transform" />
            )}
          </button>
          
          {userManagementOpen && (
            <div className="bg-gray-50">
              {userManagementItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center px-12 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 ${
                      isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' : ''
                    }`
                  }
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="px-6 py-2 text-xs text-gray-500 border-t border-gray-200 mt-4">
          <div>User: {user?.username || 'Not logged in'}</div>
          <div>Role: {user?.role || 'No role'}</div>
          <div>Is Admin: {isAdmin ? 'YES' : 'NO'}</div>
          <div>Should Show: {isAdmin ? 'YES' : 'NO'}</div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;