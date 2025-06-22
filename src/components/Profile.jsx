import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  Key,
  Shield,
  Clock,
  Activity
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    department: '',
    profile_image: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [userStats, setUserStats] = useState({
    loginCount: 0,
    lastLogin: null,
    accountCreated: null,
    totalActivities: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${user.id}`);
      const userData = response.data;
      setProfileData({
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || '',
        profile_image: userData.profile_image || ''
      });
    } catch (error) {
      toast.error('Error fetching profile data');
    }
  };

  const fetchUserStats = async () => {
    try {
      const [userResponse, activityResponse] = await Promise.all([
        axios.get(`/api/users/${user.id}`),
        axios.get(`/api/users/${user.id}/activity`)
      ]);

      const userData = userResponse.data;
      const activities = activityResponse.data;

      setUserStats({
        loginCount: userData.login_count || 0,
        lastLogin: userData.last_login,
        accountCreated: userData.created_at,
        totalActivities: activities.length
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/users/${user.id}`, {
        ...profileData,
        role: user.role, // Keep existing role
        is_active: true // Keep active status
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Verify current password by attempting login
      await axios.post('/api/auth/login', {
        username: user.username,
        password: passwordData.currentPassword
      });

      // Update password
      await axios.put(`/api/users/${user.id}`, {
        ...profileData,
        password: passwordData.newPassword,
        role: user.role,
        is_active: true
      });

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setPasswordStrength(0);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Error updating password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      setLoading(true);
      const response = await axios.post(`/api/users/${user.id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfileData(prev => ({
        ...prev,
        profile_image: response.data.imageUrl
      }));
      
      toast.success('Profile image updated successfully');
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="h-4 w-4 inline mr-1" />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="btn-secondary flex items-center"
              >
                <Key className="h-4 w-4 mr-2" />
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      required
                      className="form-input pr-10"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      required
                      className="form-input pr-10"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      className="form-input pr-10"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  {profileData.profile_image ? (
                    <img
                      src={profileData.profile_image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <Shield className="h-3 w-3 inline mr-1" />
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Logins</span>
                <span className="text-sm font-medium text-gray-900">{userStats.loginCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {userStats.lastLogin ? new Date(userStats.lastLogin).toLocaleDateString() : 'Never'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {userStats.accountCreated ? new Date(userStats.accountCreated).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Activities</span>
                <span className="text-sm font-medium text-gray-900">{userStats.totalActivities}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <Activity className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-primary-900">Activity Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">This Month</span>
                <span className="text-sm font-medium text-primary-900">
                  {userStats.totalActivities > 0 ? Math.floor(userStats.totalActivities / 4) : 0} actions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Account Status</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;