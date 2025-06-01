import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './SuperAdminDashboard.css'; // CRITICAL: Using the common CSS file

import {
  FaUserCircle,
  FaChartBar,
  FaCog,
} from 'react-icons/fa';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // <-- ENSURE setRole IS HERE
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/unauthorized');
          return;
        }

        const decoded = jwtDecode(token);
        const roleFromToken = decoded.role;

        // Redirect if user does not have an expected role for this dashboard
        if (roleFromToken !== 'user' && roleFromToken !== 'admin' && roleFromToken !== 'super_admin') {
            navigate('/unauthorized');
            return;
        }
        setRole(roleFromToken); // This uses setRole and prevents 'no-undef'

        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
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

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="User Avatar" />
            ) : (
              <FaUserCircle className="avatar-icon" />
            )}
          </div>
          <h3 className="user-name">{user?.name || 'User Name'}</h3>
          <p className="user-email">{user?.email || 'user@example.com'}</p>
          {/* Conditionally render a badge if an admin/super_admin is viewing this user dashboard */}
          {(role === 'admin' || role === 'super_admin') && (
            <span className="profile-pro-badge">Admin View</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                <FaCog className="nav-icon" /> Profile
              </Link>
            </li>
            {/* The management links relevant to users */}
            <li className="nav-item">
              <Link to="/movements" className={`nav-link ${location.pathname.startsWith('/movements') ? 'active' : ''}`}>
                <FaChartBar className="nav-icon" /> My Movements
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/maintenance" className={`nav-link ${location.pathname.startsWith('/maintenance') ? 'active' : ''}`}>
                <FaCog className="nav-icon" /> My Maintenance
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

      </div>
    </div>
  );
};

export default UserDashboard;