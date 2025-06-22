import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  LayoutDashboard,
  Users,
  ChevronRight,
  ChevronDown,
  Building,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    userManagement: false
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/requisitions', icon: FileText, label: 'Requisitions' },
  ];

  // Add admin-only routes with hierarchical structure
  const adminNavItems = user?.role === 'admin' ? [
    {
      section: 'userManagement',
      icon: Users,
      label: 'User Management',
      items: [
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/departments', icon: Building, label: 'Departments' },
        { to: '/permissions', icon: Shield, label: 'Permissions' }
      ]
    },
    { to: '/reports', icon: BarChart3, label: 'Reports & Analytics' }
  ] : [];

  // Logo debug and loading
  React.useEffect(() => {
    console.log('🔍 SIDEBAR MOUNTED: Component initialized');
    console.log('🔍 LOGO CHECK: Testing logo file accessibility...');
    
    // Test if logo file exists
    const img = new Image();
    img.onload = () => {
      console.log('✅ LOGO SUCCESS: Logo file loaded successfully');
      console.log('✅ LOGO INFO: Natural size:', img.naturalWidth, 'x', img.naturalHeight);
    };
    img.onerror = () => {
      console.log('❌ LOGO ERROR: Logo file failed to load from /logo.webp');
    };
    img.src = '/logo.webp';
  }, []);

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
                console.log('✅ SIDEBAR LOGO SIZE: Display size:', e.target.offsetWidth, 'x', e.target.offsetHeight);
                console.log('✅ SIDEBAR LOGO NATURAL: Natural size:', e.target.naturalWidth, 'x', e.target.naturalHeight);
              }}
              onError={(e) => {
                console.log('❌ SIDEBAR LOGO ERROR: Image element failed to load');
                console.log('❌ SIDEBAR LOGO SRC:', e.target.src);
                // Hide the image and show fallback
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
        {/* Regular Navigation Items */}
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

        {/* Admin Navigation Items */}
        {adminNavItems.map((item) => {
          if (item.section) {
            // Expandable section
            const isExpanded = expandedSections[item.section];
            const Icon = item.icon;
            
            return (
              <div key={item.section}>
                <button
                  onClick={() => toggleSection(item.section)}
                  className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>
                
                {/* Sub-items */}
                {isExpanded && (
                  <div className="bg-gray-50">
                    {item.items.map(({ to, icon: SubIcon, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center px-6 py-2 pl-12 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group text-sm ${
                            isActive ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' : ''
                          }`
                        }
                      >
                        <SubIcon className="h-4 w-4 mr-3" />
                        <span className="font-medium">{label}</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            // Regular item
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
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
            );
          }
        })}
      </nav>
    </div>
  );
};

export default Sidebar;