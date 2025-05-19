import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded?.role;

  useEffect(() => {
    if (!token || (role !== 'admin' && role !== 'super_admin')) {
      navigate('/unauthorized'); // You can customize this route
    }
  }, [navigate, token, role]);

  const handleAddUser = () => {
    // Redirects based on role
    if (role === 'super_admin') {
      navigate('/users/add'); // This form allows all roles to be added
    } else if (role === 'admin') {
      navigate('/users/add-user'); // A restricted version: only 'user' role
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      {/* Admin or Super Admin can add users */}
      {(role === 'admin' || role === 'super_admin') && (
        <button onClick={handleAddUser} style={{ marginBottom: '16px' }}>
          Add User
        </button>
      )}

      <div style={{ marginTop: '20px' }}>
        {/* Other admin dashboard options can be added here */}
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

export default AdminDashboard;
