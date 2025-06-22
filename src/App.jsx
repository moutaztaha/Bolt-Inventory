import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Inventory from './components/Inventory';
import Requisitions from './components/Requisitions';
import Profile from './components/Profile';
import Users from './components/Users';
import Departments from './components/Departments';
import Permissions from './components/Permissions';
import Reports from './components/Reports';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="requisitions" element={<Requisitions />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Admin Only Routes */}
              <Route path="users" element={
                <ProtectedRoute adminOnly={true}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="departments" element={
                <ProtectedRoute adminOnly={true}>
                  <Departments />
                </ProtectedRoute>
              } />
              <Route path="permissions" element={
                <ProtectedRoute adminOnly={true}>
                  <Permissions />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute adminOnly={true}>
                  <Reports />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;