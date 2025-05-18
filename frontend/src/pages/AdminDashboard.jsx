import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div>
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

export default AdminDashboard;
