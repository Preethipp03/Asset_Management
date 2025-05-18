import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import {jwtDecode} from 'jwt-decode';  // FIXED IMPORT

import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

// User pages
import UserList from './pages/users/UserList';
import AddUser from './pages/users/AddUser';
import EditUser from './pages/users/EditUser';

// Asset pages
import AssetList from './pages/assets/AssetList';
import AddAsset from './pages/assets/AddAsset';
import EditAsset from './pages/assets/EditAsset';
import ViewAsset from './pages/assets/ViewAsset';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  try {
    const decoded = jwtDecode(token);
    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" />;
    }
    return children;
  } catch (err) {
    console.error('Invalid token:', err);
    return <Navigate to="/" />;
  }
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Management Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/add"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <EditUser />
            </ProtectedRoute>
          }
        />

        {/* Asset Management Routes */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AssetList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/add"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AddAsset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <EditAsset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/view/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <ViewAsset />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
