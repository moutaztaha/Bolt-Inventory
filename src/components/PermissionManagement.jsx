import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Check,
  X,
  Lock,
  Unlock,
  Save,
  RefreshCw
} from 'lucide-react';

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permissions');
  const [hasChanges, setHasChanges] = useState(false);

  // Default permissions structure
  const defaultPermissions = [
    {
      module: 'Dashboard',
      permissions: ['view_dashboard', 'view_stats']
    },
    {
      module: 'Inventory',
      permissions: ['view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory', 'export_inventory', 'import_inventory']
    },
    {
      module: 'Users',
      permissions: ['view_users', 'create_users', 'edit_users', 'delete_users', 'manage_user_roles']
    },
    {
      module: 'Categories',
      permissions: ['view_categories', 'create_categories', 'edit_categories', 'delete_categories']
    },
    {
      module: 'Units',
      permissions: ['view_units', 'create_units', 'edit_units', 'delete_units']
    },
    {
      module: 'Locations',
      permissions: ['view_locations', 'create_locations', 'edit_locations', 'delete_locations']
    },
    {
      module: 'Suppliers',
      permissions: ['view_suppliers', 'create_suppliers', 'edit_suppliers', 'delete_suppliers']
    },
    {
      module: 'Reports',
      permissions: ['view_reports', 'export_reports', 'generate_reports']
    },
    {
      module: 'System',
      permissions: ['manage_settings', 'view_logs', 'backup_system', 'manage_permissions']
    }
  ];

  // Default role permissions (this is our "database" for now)
  const [rolePermissions, setRolePermissions] = useState({
    admin: {
      name: 'Administrator',
      description: 'Full system access',
      permissions: defaultPermissions.flatMap(module => module.permissions)
    },
    manager: {
      name: 'Manager',
      description: 'Management level access',
      permissions: [
        'view_dashboard', 'view_stats',
        'view_inventory', 'create_inventory', 'edit_inventory', 'export_inventory', 'import_inventory',
        'view_users', 'edit_users',
        'view_categories', 'create_categories', 'edit_categories',
        'view_units', 'create_units', 'edit_units',
        'view_locations', 'create_locations', 'edit_locations',
        'view_suppliers', 'create_suppliers', 'edit_suppliers',
        'view_reports', 'export_reports', 'generate_reports'
      ]
    },
    user: {
      name: 'User',
      description: 'Basic user access',
      permissions: [
        'view_dashboard', 'view_stats',
        'view_inventory', 'create_inventory', 'edit_inventory',
        'view_categories',
        'view_units',
        'view_locations',
        'view_suppliers'
      ]
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (role, permission) => {
    const roleData = rolePermissions[role];
    return roleData ? roleData.permissions.includes(permission) : false;
  };

  const togglePermission = (roleId, permission) => {
    setRolePermissions(prev => {
      const role = prev[roleId];
      if (!role) return prev;

      const currentPermissions = role.permissions || [];
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];

      setHasChanges(true);
      
      return {
        ...prev,
        [roleId]: {
          ...role,
          permissions: newPermissions
        }
      };
    });

    toast.success(`Permission ${hasPermission(roleId, permission) ? 'removed' : 'added'} for ${rolePermissions[roleId]?.name}`);
  };

  const saveChanges = () => {
    // In a real application, this would save to the server
    // For now, we'll just show a success message
    setHasChanges(false);
    toast.success('Permission changes saved successfully!');
    
    // Log the current state for debugging
    console.log('Current role permissions:', rolePermissions);
  };

  const resetChanges = () => {
    // Reset to default permissions
    setRolePermissions({
      admin: {
        name: 'Administrator',
        description: 'Full system access',
        permissions: defaultPermissions.flatMap(module => module.permissions)
      },
      manager: {
        name: 'Manager',
        description: 'Management level access',
        permissions: [
          'view_dashboard', 'view_stats',
          'view_inventory', 'create_inventory', 'edit_inventory', 'export_inventory', 'import_inventory',
          'view_users', 'edit_users',
          'view_categories', 'create_categories', 'edit_categories',
          'view_units', 'create_units', 'edit_units',
          'view_locations', 'create_locations', 'edit_locations',
          'view_suppliers', 'create_suppliers', 'edit_suppliers',
          'view_reports', 'export_reports', 'generate_reports'
        ]
      },
      user: {
        name: 'User',
        description: 'Basic user access',
        permissions: [
          'view_dashboard', 'view_stats',
          'view_inventory', 'create_inventory', 'edit_inventory',
          'view_categories',
          'view_units',
          'view_locations',
          'view_suppliers'
        ]
      }
    });
    setHasChanges(false);
    toast.success('Permissions reset to defaults');
  };

  const getPermissionIcon = (permission) => {
    if (permission.includes('view')) return <Eye className="h-4 w-4" />;
    if (permission.includes('create') || permission.includes('add')) return <Plus className="h-4 w-4" />;
    if (permission.includes('edit') || permission.includes('update')) return <Edit className="h-4 w-4" />;
    if (permission.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (permission.includes('manage')) return <Settings className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getPermissionColor = (permission) => {
    if (permission.includes('view')) return 'text-blue-600 bg-blue-50';
    if (permission.includes('create') || permission.includes('add')) return 'text-green-600 bg-green-50';
    if (permission.includes('edit') || permission.includes('update')) return 'text-yellow-600 bg-yellow-50';
    if (permission.includes('delete')) return 'text-red-600 bg-red-50';
    if (permission.includes('manage')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  const roles = Object.entries(rolePermissions).map(([key, value]) => ({
    id: key,
    ...value
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600 mt-2">Manage user roles and granular permissions</p>
        </div>
        
        {hasChanges && (
          <div className="flex space-x-3">
            <button
              onClick={resetChanges}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={saveChanges}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Permission System Status</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a demonstration permission management system. Changes are stored locally and will reset on page refresh. 
              In a production environment, these would be saved to the database.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Role Permissions
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              User Permissions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {role.permissions.length} permissions assigned
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        role.id === 'admin' ? 'bg-red-100' :
                        role.id === 'manager' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Shield className={`h-5 w-5 ${
                          role.id === 'admin' ? 'text-red-600' :
                          role.id === 'manager' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {defaultPermissions.map((module) => (
                        <div key={module.module} className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">{module.module}</h4>
                          <div className="space-y-2">
                            {module.permissions.map((permission) => (
                              <div key={permission} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={`p-1 rounded ${getPermissionColor(permission)}`}>
                                    {getPermissionIcon(permission)}
                                  </div>
                                  <span className="text-sm text-gray-700">
                                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                </div>
                                <button
                                  onClick={() => togglePermission(role.id, permission)}
                                  className={`p-1 rounded transition-colors ${
                                    hasPermission(role.id, permission)
                                      ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                      : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  {hasPermission(role.id, permission) ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions Summary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const userRole = rolePermissions[user.role];
                      const permissionCount = userRole ? userRole.permissions.length : 0;
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {permissionCount} permissions
                            </div>
                            <div className="text-sm text-gray-500">
                              {userRole ? userRole.description : 'No role assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.is_active !== false ? (
                                <Unlock className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <Lock className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <span className={`text-sm ${
                                user.is_active !== false ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {user.is_active !== false ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Module / Permission
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {defaultPermissions.map((module) => (
                <React.Fragment key={module.module}>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-4 font-medium text-gray-900" colSpan={roles.length + 1}>
                      {module.module}
                    </td>
                  </tr>
                  {module.permissions.map((permission) => (
                    <tr key={permission}>
                      <td className="py-2 px-4 text-sm text-gray-700 pl-8">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${getPermissionColor(permission)}`}>
                            {getPermissionIcon(permission)}
                          </div>
                          <span>
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="py-2 px-4 text-center">
                          <button
                            onClick={() => togglePermission(role.id, permission)}
                            className={`inline-flex p-1 rounded transition-colors ${
                              hasPermission(role.id, permission)
                                ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {hasPermission(role.id, permission) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;