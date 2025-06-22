import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  Users, 
  Activity, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  Eye,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [activities, setActivities] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loginAnalytics, setLoginAnalytics] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const tabs = [
    { id: 'activities', label: 'User Activities', icon: Activity },
    { id: 'users', label: 'User Statistics', icon: Users },
    { id: 'logins', label: 'Login Analytics', icon: UserCheck },
    { id: 'performance', label: 'Performance Metrics', icon: TrendingUp },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'activities':
          await fetchActivities();
          break;
        case 'users':
          await fetchUserStats();
          break;
        case 'logins':
          await fetchLoginAnalytics();
          break;
        case 'performance':
          await fetchPerformanceMetrics();
          break;
      }
    } catch (error) {
      toast.error('Error fetching report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    const response = await axios.get(`/api/reports/activities?days=${dateRange}`);
    setActivities(response.data);
  };

  const fetchUserStats = async () => {
    const response = await axios.get(`/api/reports/user-stats?days=${dateRange}`);
    setUserStats(response.data);
  };

  const fetchLoginAnalytics = async () => {
    const response = await axios.get(`/api/reports/login-analytics?days=${dateRange}`);
    setLoginAnalytics(response.data);
  };

  const fetchPerformanceMetrics = async () => {
    const response = await axios.get(`/api/reports/performance-metrics?days=${dateRange}`);
    setPerformanceMetrics(response.data);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'create': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActivities = () => (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{activity.username}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(activity.action)}`}>
                      {activity.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500">No user activities in the selected time period</p>
        </div>
      )}
    </div>
  );

  const renderUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Users */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.totalUsers?.[0]?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-green-100">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.activeUsers?.[0]?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Logins */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-purple-100">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Recent Logins</p>
            <p className="text-2xl font-bold text-gray-900">
              {userStats.recentLogins?.[0]?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Users by Role */}
      <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userStats.usersByRole?.map((role) => (
            <div key={role.role} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{role.count}</p>
              <p className="text-sm text-gray-600 capitalize">{role.role}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users by Department */}
      <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Department</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userStats.usersByDepartment?.map((dept) => (
            <div key={dept.department} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{dept.count}</p>
              <p className="text-sm text-gray-600">{dept.department}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoginAnalytics = () => (
    <div className="space-y-6">
      {/* Login Trends */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Trends</h3>
        <div className="space-y-4">
          {loginAnalytics.loginsByDay?.map((day) => (
            <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{day.date}</span>
              <span className="text-sm text-gray-600">{day.logins} logins</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Active Users */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
        <div className="space-y-3">
          {loginAnalytics.topActiveUsers?.map((user, index) => (
            <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">{user.activity_count} activities</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      {/* System Usage */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Usage</h3>
        <div className="space-y-3">
          {performanceMetrics.systemUsage?.map((usage) => (
            <div key={usage.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900 capitalize">{usage.action}</span>
                <p className="text-xs text-gray-500">{usage.unique_users} unique users</p>
              </div>
              <span className="text-sm text-gray-600">{usage.count} times</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
        <div className="space-y-3">
          {performanceMetrics.userEngagement?.map((user) => (
            <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">Active {user.active_days} days</p>
              </div>
              <span className="text-sm text-gray-600">{user.total_activities} activities</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'activities':
        return renderActivities();
      case 'users':
        return renderUserStats();
      case 'logins':
        return renderLoginAnalytics();
      case 'performance':
        return renderPerformanceMetrics();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">System usage reports and user analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            className="form-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          
          <button className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;