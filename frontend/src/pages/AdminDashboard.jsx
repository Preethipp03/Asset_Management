import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import './SuperAdminDashboard.css';

import {
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaUserCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/unauthorized');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const roleFromToken = decoded.role;

        if (roleFromToken !== 'admin' && roleFromToken !== 'super_admin') {
          navigate('/unauthorized');
          return;
        }

        // Fetch user profile data
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user or decoding token:', error);
        navigate('/unauthorized');
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      localStorage.removeItem('token');
      navigate('/');
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
          <h3 className="user-name">{user.name || 'User Name'}</h3>
          <p className="user-email">{user.email || 'user@example.com'}</p>
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/users" className="nav-link">
                <FaUserCircle className="nav-icon" /> User Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/assets" className="nav-link">
                <FaFileAlt className="nav-icon" /> Asset Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/movements" className="nav-link">
                <FaChartBar className="nav-icon" /> Movement Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/maintenance" className="nav-link">
                <FaCog className="nav-icon" /> Maintenance Management
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <FaCog className="nav-icon" /> Profile
              </Link>
            </li>
            <li className="nav-item logout">
              <button onClick={handleLogout} className="nav-link logout-button">
                <FaUserCircle className="nav-icon" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Empty main content */}
      </div>
    </div>
  );
};

export default AdminDashboard;
