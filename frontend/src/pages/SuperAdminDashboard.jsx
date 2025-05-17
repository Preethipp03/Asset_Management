import React, { useEffect } from 'react';

const SuperAdminDashboard = () => {
  useEffect(() => {
    console.log('SuperAdminDashboard mounted');
  }, []);

  return (
<div >
   Super Admin Dashboard - Test Text Visible
  </div>
  );
};

export default SuperAdminDashboard;
