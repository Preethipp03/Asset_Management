import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SuperAdminDashboard.css';
import {
  FaUserCircle,
  FaHome,
  FaFileAlt,
  FaEnvelope,
  FaBell,
  FaMapMarkerAlt,
  FaChartBar,
  FaCog,
} from 'react-icons/fa';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // <-- get navigate function


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');  // <-- navigate to home or login page on logout
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle className="avatar-icon" />
          </div>
          <h3 className="user-name">{user?.name || 'User Name'}</h3>
          <p className="user-email">{user?.email || 'user@example.com'}</p>
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
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <FaCog className="nav-icon" /> Profile
              </Link>
            </li>
            {/* Logout Button */}
                        <li className="nav-item logout">
                          <button onClick={handleLogout} className="nav-link logout-button">
                            <FaUserCircle className="nav-icon" /> Logout
                          </button>
                        </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
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
