import React from 'react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Admin Dashboard</h1>

      {/* User Management */}
      <div style={{ marginTop: '20px' }}>
        <h2>User Management</h2>
        <Link to="/users" style={{ marginRight: '10px' }}>
          <button>View Users</button>
        </Link>
        <Link to="/users/add">
          <button>Add User</button>
        </Link>
      </div>

      {/* Asset Management */}
      <div style={{ marginTop: '20px' }}>
        <h2>Asset Management</h2>
        <Link to="/assets" style={{ marginRight: '10px' }}>
          <button>View Assets</button>
        </Link>
        <Link to="/assets/add">
          <button>Add Asset</button>
        </Link>
      </div>

      {/* Movement Management */}
      <div style={{ marginTop: '20px' }}>
        <h2>Movement Management</h2>
        <Link to="/movements" style={{ marginRight: '10px' }}>
          <button>View Movements</button>
        </Link>
        <Link to="/movements/add">
          <button>Add Movement</button>
        </Link>
      </div>

      {/* Maintenance Management */}
      <div style={{ marginTop: '20px' }}>
        <h2>Maintenance Management</h2>
        <Link to="/maintenance" style={{ marginRight: '10px' }}>
          <button>View Maintenance</button>
        </Link>
        <Link to="/maintenance/add">
          <button>Add Maintenance</button>
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
