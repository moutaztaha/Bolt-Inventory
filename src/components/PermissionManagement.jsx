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
  RefreshCw,
  UserPlus,
  Copy
} from 'lucide-react';

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permissions');
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    id: '',
    name: '',
    description: '',
    permissions: []
  });

  // Default permissions structure - UPDATED with Requisitions
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
      module: 'Requisitions',
      permissions: ['view_requisitions', 'create_requisitions', 'edit_requisitions', 'delete_requisitions', 'approve_requisitions', 'submit_requisitions']
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

  // Default role permissions with ability to add custom roles - UPDATED with Requisitions
  const [rolePermissions, setRolePermissions] = useState({
    admin: {
      name: 'Administrator',
      description: 'Full system access',
      isDefault: true,
      permissions: defaultPermissions.flatMap(module => module.permissions)
    },
    manager: {
      name: 'Manager',
      description: 'Management level access',
      isDefault: true,
      permissions: [
        'view_dashboard', 'view_stats',
        'view_inventory', 'create_inventory', 'edit_inventory', 'export_inventory', 'import_inventory',
        'view_requisitions', 'create_requisitions', 'edit_requisitions', 'approve_requisitions', 'submit_requisitions',
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
      isDefault: true,
      permissions: [
        'view_dashboard', 'view_stats',
        'view_inventory', 'create_inventory', 'edit_inventory',
        'view_requisitions', 'create_requisitions', 'edit_requisitions', 'submit_requisitions',
        'view_categories',
        'view_units',
        'view_locations',
        'view_suppliers'
      ]
    }
  });

  useEffect(() => {
    fetchUsers();
    loadCustomRoles();
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

  const loadCustomRoles = () => {
    // Load custom roles from localStorage
    const savedRoles = localStorage.getItem('customRoles');
    if (savedRoles) {
      try {
        const customRoles = JSON.parse(savedRoles);
        setRolePermissions(prev => ({
          ...prev,
          ...customRoles
        }));
      } catch (error) {
        console.error('Error loading custom roles:', error);
      }
    }
  };

  const saveCustomRoles = (roles) => {
    // Save only custom roles (non-default) to localStorage
    const customRoles = {};
    Object.entries(roles).forEach(([key, value]) => {
      if (!value.isDefault) {
        customRoles[key] = value;
      }
    });
    localStorage.setItem('customRoles', JSON.stringify(customRoles));
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

      const updatedRoles = {
        ...prev,
        [roleId]: {
          ...role,
          permissions: newPermissions
        }
      };

      setHasChanges(true);
      saveCustomRoles(updatedRoles);
      
      return updatedRoles;
    });

    toast.success(`Permission ${hasPermission(roleId, permission) ? 'removed' : 'added'} for ${rolePermissions[roleId]?.name}`);
  };

  const saveChanges = () => {
    setHasChanges(false);
    toast.success('Permission changes saved successfully!');
    console.log('Current role permissions:', rolePermissions);
  };

  const resetChanges = () => {
    // Reset to default permissions and remove custom roles
    setRolePermissions({
      admin: {
        name: 'Administrator',
        description: 'Full system access',
        isDefault: true,
        permissions: defaultPermissions.flatMap(module => module.permissions)
      },
      manager: {
        name: 'Manager',
        description: 'Management level access',
        isDefault: true,
        permissions: [
          'view_dashboard', 'view_stats',
          'view_inventory', 'create_inventory', 'edit_inventory', 'export_inventory', 'import_inventory',
          'view_requisitions', 'create_requisitions', 'edit_requisitions', 'approve_requisitions', 'submit_requisitions',
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
        isDefault: true,
        permissions: [
          'view_dashboard', 'view_stats',
          'view_inventory', 'create_inventory', 'edit_inventory',
          'view_requisitions', 'create_requisitions', 'edit_requisitions', 'submit_requisitions',
          'view_categories',
          'view_units',
          'view_locations',
          'view_suppliers'
        ]
      }
    });
    localStorage.removeItem('customRoles');
    setHasChanges(false);
    toast.success('Permissions reset to defaults');
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setNewRole({
      id: '',
      name: '',
      description: '',
      permissions: []
    });
    setShowAddRoleModal(true);
  };

  const handleEditRole = (roleId) => {
    const role = rolePermissions[roleId];
    if (role && !role.isDefault) {
      setEditingRole(roleId);
      setNewRole({
        id: roleId,
        name: role.name,
        description: role.description,
        permissions: [...role.permissions]
      });
      setShowAddRoleModal(true);
    } else {
      toast.error('Cannot edit default system roles');
    }
  };

  const handleDeleteRole = (roleId) => {
    const role = rolePermissions[roleId];
    if (role && !role.isDefault) {
      // Check if any users have this role
      const usersWithRole = users.filter(user => user.role === roleId);
      if (usersWithRole.length > 0) {
        toast.error(`Cannot delete role. ${usersWithRole.length} user(s) are assigned to this role.`);
        return;
      }

      setRolePermissions(prev => {
        const updated = { ...prev };
        delete updated[roleId];
        saveCustomRoles(updated);
        return updated;
      });
      toast.success(`Role "${role.name}" deleted successfully`);
    } else {
      toast.error('Cannot delete default system roles');
    }
  };

  const handleDuplicateRole = (roleId) => {
    const role = rolePermissions[roleId];
    if (role) {
      setEditingRole(null);
      setNewRole({
        id: '',
        name: `${role.name} Copy`,
        description: `Copy of ${role.description}`,
        permissions: [...role.permissions]
      });
      setShowAddRoleModal(true);
    }
  };

  const handleSaveRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    const roleId = editingRole || newRole.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check if role ID already exists (for new roles)
    if (!editingRole && rolePermissions[roleId]) {
      toast.error('A role with this name already exists');
      return;
    }

    setRolePermissions(prev => {
      const updated = {
        ...prev,
        [roleId]: {
          name: newRole.name,
          description: newRole.description,
          isDefault: false,
          permissions: newRole.permissions
        }
      };
      saveCustomRoles(updated);
      return updated;
    });

    setShowAddRoleModal(false);
    toast.success(`Role "${newRole.name}" ${editingRole ? 'updated' : 'created'} successfully`);
  };

  const toggleRolePermission = (permission) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
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

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getRoleIconColor = (roleId) => {
    switch (roleId) {
      case 'admin': return 'bg-red-100 text-red-600';
      case 'manager': return 'bg-blue-100 text-blue-600';
      case 'user': return 'bg-green-100 text-green-600';
      default: return 'bg-purple-100 text-purple-600';
    }
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
        
        <div className="flex space-x-3">
          <button
            onClick={handleAddRole}
            className="btn-success flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Role
          </button>
          
          {hasChanges && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Dynamic Role Management</h3>
            <p className="text-sm text-blue-700 mt-1">
              Create custom roles with specific permissions. Default roles (Admin, Manager, User) cannot be deleted but can be modified. 
              Custom roles are saved locally and persist across sessions.
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
              Role Permissions ({roles.length} roles)
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
              User Permissions ({users.length} users)
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                          {role.isDefault && (
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {role.permissions.length} permissions assigned
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${getRoleIconColor(role.id)}`}>
                        <Shield className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => handleDuplicateRole(role.id)}
                        className="flex-1 btn-secondary text-xs py-1 flex items-center justify-center"
                        title="Duplicate Role"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                      {!role.isDefault && (
                        <>
                          <button
                            onClick={() => handleEditRole(role.id)}
                            className="flex-1 btn-primary text-xs py-1 flex items-center justify-center"
                            title="Edit Role"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 rounded flex items-center justify-center"
                            title="Delete Role"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </>
                      )}
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {userRole ? userRole.name : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                    <div className="flex flex-col items-center">
                      <span>{role.name}</span>
                      {!role.isDefault && (
                        <span className="text-xs text-purple-600 mt-1">Custom</span>
                      )}
                    </div>
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

      {/* Add/Edit Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h2>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Role Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter role description"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Permissions ({newRole.permissions.length} selected)
                  </h3>
                  <div className="space-y-6">
                    {defaultPermissions.map((module) => (
                      <div key={module.module} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{module.module}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {module.permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={permission}
                                checked={newRole.permissions.includes(permission)}
                                onChange={() => toggleRolePermission(permission)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={permission} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                <div className={`p-1 rounded ${getPermissionColor(permission)}`}>
                                  {getPermissionIcon(permission)}
                                </div>
                                <span>
                                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="btn-primary"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;