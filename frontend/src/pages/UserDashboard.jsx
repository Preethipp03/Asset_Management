import React, { useEffect } from 'react';

const UserDashboard = () => {
  useEffect(() => {
    console.log('UserDashboard mounted');
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, User! You have basic access.</p>
    </div>
  );
};

export default UserDashboard;
