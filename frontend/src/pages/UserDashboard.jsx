import React from 'react';
import { Link } from 'react-router-dom';
import './SuperAdminDashboard.css'; // Reusing existing CSS
import { FaUserCircle, FaHome, FaFileAlt, FaEnvelope, FaBell, FaMapMarkerAlt, FaChartBar } from 'react-icons/fa';

const UserDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar copied from SuperAdmin */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle className="avatar-icon" />
          </div>
          <h3 className="user-name">User</h3>
          <p className="user-email">user@company.com</p>
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                <FaHome className="nav-icon" /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/file" className="nav-link">
                <FaFileAlt className="nav-icon" /> File
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/messages" className="nav-link">
                <FaEnvelope className="nav-icon" /> Messages
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/notification" className="nav-link">
                <FaBell className="nav-icon" /> Notification
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/location" className="nav-link">
                <FaMapMarkerAlt className="nav-icon" /> Location
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/graph" className="nav-link">
                <FaChartBar className="nav-icon" /> Graph
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content — only the features from your original code */}
      <div className="main-content">
        <h1>User Dashboard</h1>
        <p>Welcome! Limited access for users.</p>

        <div className="management-section">
          <h2>Movement Management</h2>
          <div className="management-buttons">
            <Link to="/movements">
              <button className="styled-button">View Movements</button>
            </Link>
            <Link to="/movements/add">
              <button className="styled-button">Add Movement</button>
            </Link>
          </div>
        </div>

        <div className="management-section">
          <h2>Maintenance Management</h2>
          <div className="management-buttons">
            <Link to="/maintenance">
              <button className="styled-button">View Maintenance</button>
            </Link>
            <Link to="/maintenance/add">
              <button className="styled-button">Add Maintenance</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
