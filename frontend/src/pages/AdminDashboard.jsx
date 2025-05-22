import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './SuperAdminDashboard.css'; // Reuse the same CSS

import { FaUserCircle, FaHome, FaFileAlt, FaEnvelope, FaBell, FaMapMarkerAlt, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded?.role;

  useEffect(() => {
    if (!token || (role !== 'admin' && role !== 'super_admin')) {
      navigate('/unauthorized');
    }
  }, [navigate, token, role]);

  const handleAddUser = () => {
    if (role === 'super_admin') {
      navigate('/users/add');
    } else if (role === 'admin') {
      navigate('/users/add-user');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle className="avatar-icon" />
          </div>
          <h3 className="user-name">Admin Panel</h3>
          <p className="user-email">admin@company.com</p>
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link"><FaHome className="nav-icon" /> Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/file" className="nav-link"><FaFileAlt className="nav-icon" /> File</Link>
            </li>
            <li className="nav-item">
              <Link to="/messages" className="nav-link"><FaEnvelope className="nav-icon" /> Messages</Link>
            </li>
            <li className="nav-item">
              <Link to="/notification" className="nav-link"><FaBell className="nav-icon" /> Notification</Link>
            </li>
            <li className="nav-item">
              <Link to="/location" className="nav-link"><FaMapMarkerAlt className="nav-icon" /> Location</Link>
            </li>
            <li className="nav-item">
              <Link to="/graph" className="nav-link"><FaChartBar className="nav-icon" /> Graph</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="your-original-links-section">
          <h1>Admin Dashboard</h1>

          {(role === 'admin' || role === 'super_admin') && (
            <div className="management-section">
              <h2>User Management</h2>
              <div className="management-buttons">
                <button className="styled-button" onClick={handleAddUser}>Add User</button>
                <Link to="/users"><button className="styled-button">View Users</button></Link>
              </div>
            </div>
          )}

          <div className="management-section">
            <h2>Asset Management</h2>
            <div className="management-buttons">
              <Link to="/assets"><button className="styled-button">View Assets</button></Link>
              <Link to="/assets/add"><button className="styled-button">Add Asset</button></Link>
            </div>
          </div>

          <div className="management-section">
            <h2>Movement Management</h2>
            <div className="management-buttons">
              <Link to="/movements"><button className="styled-button">View Movements</button></Link>
              <Link to="/movements/add"><button className="styled-button">Add Movement</button></Link>
            </div>
          </div>

          <div className="management-section">
            <h2>Maintenance Management</h2>
            <div className="management-buttons">
              <Link to="/maintenance"><button className="styled-button">View Maintenance</button></Link>
              <Link to="/maintenance/add"><button className="styled-button">Add Maintenance</button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
