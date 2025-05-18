import React from 'react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Admin Dashboard</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>User Management</h2>
        <Link to="/users" style={{ marginRight: '10px' }}>
          <button>View Users</button>
        </Link>
        <Link to="/users/add">
          <button>Add User</button>
        </Link>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Asset Management</h2>
        <Link to="/assets" style={{ marginRight: '10px' }}>
          <button>View Assets</button>
        </Link>
        <Link to="/assets/add">
          <button>Add Asset</button>
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
