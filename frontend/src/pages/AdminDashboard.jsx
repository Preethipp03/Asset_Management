import React, { useEffect } from 'react';

const AdminDashboard = () => {
  useEffect(() => {
    console.log('AdminDashboard mounted');
  }, []);

  return (
    <div>
      <h1>admin Dashboard</h1>
      <p>Welcome, User! You have basic access.</p>
    </div>
  );
};

export default AdminDashboard;
