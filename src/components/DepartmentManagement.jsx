import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building,
  Users,
  User,
  X
} from 'lucide-react';
import ConfirmationModal from './modals/ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    location: ''
  });
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept.manager && dept.manager.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDepartments(filtered);
  }, [departments, searchTerm]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDepartment) {
        await axios.put(`/api/departments/${editingDepartment.id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await axios.post('/api/departments', formData);
        toast.success('Department created successfully');
      }
      
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ name: '', description: '', manager: '', location: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      manager: department.manager || '',
      location: department.location || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirmation({
      title: 'Delete Department',
      message: `Are you sure you want to delete the department "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: Trash2
    });

    if (confirmed) {
      try {
        await axios.delete(`/api/departments/${id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error deleting department');
      }
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({ name: '', description: '', manager: '', location: '' });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && departments.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-2">Manage organizational departments and their details</p>
        </div>
        
        <button onClick={handleAdd} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <Building className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter(d => d.manager).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <User className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, d) => sum + (d.user_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search departments by name, manager, or description..."
              className="pl-10 form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{department.name}</div>
                        {department.description && (
                          <div className="text-sm text-gray-500">{department.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {department.manager || (
                        <span className="text-gray-400 italic">No manager assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {department.location || (
                        <span className="text-gray-400 italic">No location set</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {department.user_count || 0} users
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit Department"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id, department.name)}
                        className="text-error-600 hover:text-error-900"
                        title="Delete Department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first department'}
            </p>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
        icon={confirmationState.icon}
      />

      {/* Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="form-input"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter department description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    className="form-input"
                    value={formData.manager}
                    onChange={handleChange}
                    placeholder="Enter manager name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter department location"
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
                onClick={handleSubmit}
              >
                {loading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;