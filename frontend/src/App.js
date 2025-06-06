import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';

import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized'; 

// User pages
import UserList from './pages/users/UserList';
import AddUser from './pages/users/AddUser';
import EditUser from './pages/users/EditUser';
import AddUserAdmin from './pages/users/AddUserAdmin';

// Asset pages
import AssetList from './pages/assets/AssetList';
import AddAsset from './pages/assets/AddAsset';
import EditAsset from './pages/assets/EditAsset';
import ViewAsset from './pages/assets/ViewAsset';

// Movement pages
import MovementList from './pages/movements/MovementList';
import AddMovement from './pages/movements/AddMovement';
import EditMovement from './pages/movements/EditMovement';
import ViewMovement from './pages/movements/ViewMovement';

// Maintenance pages
import MaintenanceList from './pages/maintenance/MaintenanceList';
import AddMaintenance from './pages/maintenance/AddMaintenance';
import EditMaintenance from './pages/maintenance/EditMaintenance';

import MovementReport from './pages/Reports/MovementReport';
import MaintenanceReport from './pages/Reports/MaintenanceReport';

//Profile pages
import Profile from './pages/profile';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

       <Route path="/unauthorized" element={<Unauthorized />} /> 

        
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'user']}>
            <Profile />
            </ProtectedRoute>
  }
/>

        {/* Dashboards */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin','admin']}>
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

        {/* User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
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
          path="/users/add-user"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddUserAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <EditUser />
            </ProtectedRoute>
          }
        />

        {/* Asset Management */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin','user']}>
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

        {/* Movement Management */}
        <Route
          path="/movements"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin', 'user']}>
              <MovementList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movements/add"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AddMovement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movements/view/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin', 'user']}>
              <ViewMovement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movements/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <EditMovement />
            </ProtectedRoute>
          }
        />

        {/* Maintenance Management */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin', 'user']}>
              <MaintenanceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance/add"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AddMaintenance />
            </ProtectedRoute>
          }
        />
        <Route
  path="/edit-maintenance/:id"
  element={
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <EditMaintenance />
    </ProtectedRoute>
  }
/>
<Route
  path="/reports/movements"
  element={
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <MovementReport />
    </ProtectedRoute>
  }
/>
<Route
  path="/reports/maintenance"
  element={
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <MaintenanceReport />
    </ProtectedRoute>
  }
/>


      </Routes>
    </BrowserRouter>
  );
};

export default App;
