import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { jwtDecode } from 'jwt-decode';  // Use named import because of your earlier error

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/" />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token role:', decoded.role);

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      console.log('Role not allowed:', decoded.role);
      return <Navigate to="/" />;
    }

    return children;
  } catch (err) {
    console.log('Token decoding failed:', err);
    return <Navigate to="/" />;
  }
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

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
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
