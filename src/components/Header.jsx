import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-sm text-gray-600">
            Manage your factory operations efficiently
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
            title="My Profile"
          >
            <User className="h-5 w-5" />
            <span className="font-medium">My Profile</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-error-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;