import React from 'react';
import { Link } from 'react-router-dom';
import './SuperAdminDashboard.css';
import {
  FaHome, FaFileAlt, FaEnvelope, FaBell, FaMapMarkerAlt,
  FaChartBar, FaDollarSign, FaShareAlt, FaThumbsUp, FaStar,
  FaCaretDown, FaCog, FaEllipsisV, FaUserCircle
} from 'react-icons/fa';

const SuperAdminDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* ----------------- SIDEBAR ----------------- */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle className="avatar-icon" />
          </div>
          <h3 className="user-name">rProcess</h3>
          <p className="user-email">rprocess@gmail.com.com</p>
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

      {/* ----------------- MAIN CONTENT ----------------- */}
      <div className="main-content">
    
        {/* ----------------- YOUR ORIGINAL CODE ----------------- */}
        <div className="your-original-links-section">
          <h1>Super Admin Dashboard</h1>

          {/* User Management */}
          <div className="management-section">
            <h2>User Management</h2>
            <div className="management-buttons">
              <Link to="/users">
                <button className="styled-button">View Users</button>
              </Link>
              <Link to="/users/add">
                <button className="styled-button">Add User</button>
              </Link>
            </div>
          </div>

          {/* Asset Management */}
          <div className="management-section">
            <h2>Asset Management</h2>
            <div className="management-buttons">
              <Link to="/assets">
                <button className="styled-button">View Assets</button>
              </Link>
              <Link to="/assets/add">
                <button className="styled-button">Add Asset</button>
              </Link>
            </div>
          </div>

          {/* Movement Management */}
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

          {/* Maintenance Management */}
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
    </div>
  );
};

export default SuperAdminDashboard;
