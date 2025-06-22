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
  Shield
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

  // SIMPLE LOGO TEST - Log everything to console
  React.useEffect(() => {
    console.log('🔍 LOGO DEBUG: Sidebar component mounted');
    console.log('🔍 LOGO DEBUG: Checking logo file...');
    
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
    <div className="bg-white shadow-lg" style={{ width: '600px', minWidth: '600px' }}>
      <div className="p-8 border-b border-gray-200">
        <div className="flex flex-col items-center space-y-6">
          {/* MASSIVE LOGO TEST CONTAINER */}
          <div 
            style={{ 
              width: '500px', 
              height: '500px',
              border: '10px solid red',
              backgroundColor: 'yellow',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* LOGO IMAGE */}
            <img 
              src="/logo.webp" 
              alt="Factory Management System" 
              style={{ 
                width: '480px',
                height: '480px',
                objectFit: 'contain',
                border: '5px solid blue'
              }}
              onLoad={(e) => {
                console.log('✅ LOGO LOADED: Image element loaded successfully');
                console.log('✅ LOGO SIZE: Display size:', e.target.offsetWidth, 'x', e.target.offsetHeight);
                console.log('✅ LOGO NATURAL: Natural size:', e.target.naturalWidth, 'x', e.target.naturalHeight);
              }}
              onError={(e) => {
                console.log('❌ LOGO ERROR: Image element failed to load');
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            
            {/* FALLBACK CONTENT */}
            <div 
              style={{ 
                display: 'none',
                width: '480px',
                height: '480px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                alignItems: 'center',
                justifyContent: 'center',
                border: '5px solid green'
              }}
            >
              NO LOGO
            </div>
            
            {/* DEBUG OVERLAY */}
            <div 
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px',
                fontSize: '16px',
                zIndex: 1000,
                border: '2px solid white'
              }}
            >
              CONTAINER: 500×500px<br/>
              IMAGE: 480×480px<br/>
              CHECK CONSOLE!
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">FMS</h1>
            <p className="text-xl text-gray-600">Factory Management</p>
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