import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>User Dashboard</h1>
      <p>Welcome! Limited access for users.</p>
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

export default UserDashboard;
