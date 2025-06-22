import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Download, 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp,
  Clock,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserReports = () => {
  const [reportData, setReportData] = useState({
    userStats: {},
    activityStats: {},
    loginStats: {},
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [usersRes, activitiesRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/reports/activities', { params: { days: dateRange } })
      ]);

      setUsers(usersRes.data);
      setActivities(activitiesRes.data || []);

      // Calculate statistics
      const userStats = calculateUserStats(usersRes.data);
      const activityStats = calculateActivityStats(activitiesRes.data || []);
      const loginStats = calculateLoginStats(activitiesRes.data || []);
      const departmentStats = calculateDepartmentStats(usersRes.data);

      setReportData({
        userStats,
        activityStats,
        loginStats,
        departmentStats
      });
    } catch (error) {
      toast.error('Error fetching report data');
      console.error('Report data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (users) => {
    const total = users.length;
    const active = users.filter(u => u.is_active !== false).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const managers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    const recentLogins = users.filter(u => {
      if (!u.last_login) return false;
      const loginDate = new Date(u.last_login);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
      return loginDate > cutoff;
    }).length;

    return {
      total,
      active,
      inactive: total - active,
      admins,
      managers,
      regularUsers,
      recentLogins,
      averageLoginCount: users.reduce((sum, u) => sum + (u.login_count || 0), 0) / total || 0
    };
  };

  const calculateActivityStats = (activities) => {
    const total = activities.length;
    const byAction = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});

    const byDay = activities.reduce((acc, activity) => {
      const date = new Date(activity.created_at).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byAction,
      byDay,
      averagePerDay: total / parseInt(dateRange) || 0
    };
  };

  const calculateLoginStats = (activities) => {
    const logins = activities.filter(a => a.action === 'login');
    const logouts = activities.filter(a => a.action === 'logout');
    
    const loginsByDay = logins.reduce((acc, login) => {
      const date = new Date(login.created_at).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const loginsByHour = logins.reduce((acc, login) => {
      const hour = new Date(login.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return {
      totalLogins: logins.length,
      totalLogouts: logouts.length,
      loginsByDay,
      loginsByHour,
      averageLoginsPerDay: logins.length / parseInt(dateRange) || 0
    };
  };

  const calculateDepartmentStats = (users) => {
    const departments = users.reduce((acc, user) => {
      const dept = user.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          name: dept,
          totalUsers: 0,
          activeUsers: 0,
          admins: 0,
          managers: 0,
          regularUsers: 0
        };
      }
      
      acc[dept].totalUsers++;
      if (user.is_active !== false) acc[dept].activeUsers++;
      if (user.role === 'admin') acc[dept].admins++;
      if (user.role === 'manager') acc[dept].managers++;
      if (user.role === 'user') acc[dept].regularUsers++;
      
      return acc;
    }, {});

    return Object.values(departments);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('User Management Report', 14, 22);
    
    // Report info
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Date Range: Last ${dateRange} days`, 14, 38);
    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 46);

    let yPosition = 60;

    // User Statistics
    doc.setFontSize(16);
    doc.text('User Statistics', 14, yPosition);
    yPosition += 10;

    const userStatsData = [
      ['Total Users', reportData.userStats.total?.toString() || '0'],
      ['Active Users', reportData.userStats.active?.toString() || '0'],
      ['Inactive Users', reportData.userStats.inactive?.toString() || '0'],
      ['Administrators', reportData.userStats.admins?.toString() || '0'],
      ['Managers', reportData.userStats.managers?.toString() || '0'],
      ['Regular Users', reportData.userStats.regularUsers?.toString() || '0'],
      ['Recent Logins', reportData.userStats.recentLogins?.toString() || '0'],
      ['Avg Login Count', reportData.userStats.averageLoginCount?.toFixed(1) || '0']
    ];

    doc.autoTable({
      head: [['Metric', 'Value']],
      body: userStatsData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // Activity Statistics
    doc.setFontSize(16);
    doc.text('Activity Statistics', 14, yPosition);
    yPosition += 10;

    const activityStatsData = [
      ['Total Activities', reportData.activityStats.total?.toString() || '0'],
      ['Average Per Day', reportData.activityStats.averagePerDay?.toFixed(1) || '0'],
      ['Login Actions', reportData.activityStats.byAction?.login?.toString() || '0'],
      ['Create Actions', reportData.activityStats.byAction?.create?.toString() || '0'],
      ['Update Actions', reportData.activityStats.byAction?.update?.toString() || '0'],
      ['Delete Actions', reportData.activityStats.byAction?.delete?.toString() || '0']
    ];

    doc.autoTable({
      head: [['Metric', 'Value']],
      body: activityStatsData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // Department Statistics
    if (reportData.departmentStats.length > 0) {
      doc.setFontSize(16);
      doc.text('Department Statistics', 14, yPosition);
      yPosition += 10;

      const departmentData = reportData.departmentStats.map(dept => [
        dept.name,
        dept.totalUsers.toString(),
        dept.activeUsers.toString(),
        dept.admins.toString(),
        dept.managers.toString(),
        dept.regularUsers.toString()
      ]);

      doc.autoTable({
        head: [['Department', 'Total', 'Active', 'Admins', 'Managers', 'Users']],
        body: departmentData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    doc.save(`user-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report downloaded successfully');
  };

  const exportCSV = () => {
    const csvData = [];
    
    // Add headers
    csvData.push(['User Management Report']);
    csvData.push([`Generated on: ${new Date().toLocaleDateString()}`]);
    csvData.push([`Date Range: Last ${dateRange} days`]);
    csvData.push(['']);
    
    // User Statistics
    csvData.push(['User Statistics']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Users', reportData.userStats.total || 0]);
    csvData.push(['Active Users', reportData.userStats.active || 0]);
    csvData.push(['Inactive Users', reportData.userStats.inactive || 0]);
    csvData.push(['Administrators', reportData.userStats.admins || 0]);
    csvData.push(['Managers', reportData.userStats.managers || 0]);
    csvData.push(['Regular Users', reportData.userStats.regularUsers || 0]);
    csvData.push(['']);
    
    // Activity Statistics
    csvData.push(['Activity Statistics']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Activities', reportData.activityStats.total || 0]);
    csvData.push(['Average Per Day', (reportData.activityStats.averagePerDay || 0).toFixed(1)]);
    csvData.push(['']);
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully');
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
          <h1 className="text-3xl font-bold text-gray-900">User Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive user activity and performance reports</p>
        </div>
        
        <div className="flex space-x-3">
          <button onClick={fetchReportData} className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button onClick={exportCSV} className="btn-success flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button onClick={generatePDF} className="btn-primary flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="overview">Overview Report</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="activity">Activity Focus</option>
              <option value="performance">Performance Metrics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <Users className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.userStats.total || 0}</p>
              <p className="text-xs text-gray-500">
                {reportData.userStats.active || 0} active, {reportData.userStats.inactive || 0} inactive
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.activityStats.total || 0}</p>
              <p className="text-xs text-gray-500">
                {(reportData.activityStats.averagePerDay || 0).toFixed(1)} per day avg
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Logins</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.userStats.recentLogins || 0}</p>
              <p className="text-xs text-gray-500">
                Last {dateRange} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Login Count</p>
              <p className="text-2xl font-bold text-gray-900">
                {(reportData.userStats.averageLoginCount || 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">
                Per user
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-primary-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Role Distribution</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Administrators</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {reportData.userStats.admins || 0} ({((reportData.userStats.admins || 0) / (reportData.userStats.total || 1) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Managers</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {reportData.userStats.managers || 0} ({((reportData.userStats.managers || 0) / (reportData.userStats.total || 1) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Regular Users</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {reportData.userStats.regularUsers || 0} ({((reportData.userStats.regularUsers || 0) / (reportData.userStats.total || 1) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-primary-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(reportData.activityStats.byAction || {}).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 capitalize">{action}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {count} ({((count / (reportData.activityStats.total || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      {reportData.departmentStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Department Statistics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Managers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regular Users
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.departmentStats.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.totalUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.activeUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.admins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.managers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.regularUsers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;