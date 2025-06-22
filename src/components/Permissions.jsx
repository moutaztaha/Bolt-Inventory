import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Shield, 
  User, 
  Users, 
  Package, 
  FileText, 
  Building, 
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Check,
  X
} from 'lucide-react';

const Permissions = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const permissions = {
    dashboard: { icon: BarChart3, label: 'Dashboard', description: 'View dashboard and analytics' },
    inventory: { icon: Package, label: 'Inventory Management', description: 'Manage inventory items, categories, units' },
    requisitions: { icon: FileText, label: 'Requisitions', description: 'Create and manage requisitions' },
    users: { icon: Users, label: 'User Management', description: 'Manage system users' },
    departments: { icon: Building, label: 'Department Management', description: 'Manage departments' },
    reports: { icon: BarChart3, label: 'Reports & Analytics', description: 'Access reports and analytics' },
    settings: { icon: Settings, label: 'System Settings', description: 'Configure system settings' }
  };

  const rolePermissions = {
    admin: ['dashboard', 'inventory', 'requisitions', 'users', 'departments', 'reports', 'settings'],
    manager: ['dashboard', 'inventory', 'requisitions', 'reports'],
    user: ['dashboard', 'inventory', 'requisitions']
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasPermission = (userRole, permission) => {
    return rolePermissions[userRole]?.includes(permission) || false;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
          <p className="text-gray-600 mt-2">Manage user roles and their system permissions</p>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(rolePermissions).map(([role, perms]) => (
          <div key={role} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{role}</h3>
                <p className="text-sm text-gray-500">{perms.length} permissions</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {perms.map(perm => {
                const permission = permissions[perm];
                const Icon = permission.icon;
                return (
                  <div key={perm} className="flex items-center text-sm text-gray-600">
                    <Icon className="h-4 w-4 mr-2 text-gray-400" />
                    {permission.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Permissions Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">Overview of permissions by role</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(permissions).map(([key, permission]) => {
                const Icon = permission.icon;
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hasPermission('user', key) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hasPermission('manager', key) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hasPermission('admin', key) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users by Role */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Users by Role</h2>
          <p className="text-sm text-gray-600 mt-1">Current user assignments</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['admin', 'manager', 'user'].map(role => {
              const roleUsers = users.filter(user => user.role === role);
              return (
                <div key={role} className="space-y-3">
                  <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getRoleColor(role)}`}>
                    <Shield className="h-4 w-4 mr-1" />
                    {role.charAt(0).toUpperCase() + role.slice(1)} ({roleUsers.length})
                  </div>
                  
                  <div className="space-y-2">
                    {roleUsers.length > 0 ? (
                      roleUsers.map(user => (
                        <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <div className="flex-shrink-0">
                            {user.is_active ? (
                              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                            ) : (
                              <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No users with this role
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Permission Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-500 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Permission Guidelines</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div><strong>Admin:</strong> Full system access including user management, system settings, and all reports</div>
              <div><strong>Manager:</strong> Can manage inventory, approve requisitions, and access reports</div>
              <div><strong>User:</strong> Basic access to view dashboard, manage inventory, and create requisitions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;