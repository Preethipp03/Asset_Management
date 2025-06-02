import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
   FaFileAlt,
  FaChartBar, FaCog, FaUserCircle
} from 'react-icons/fa'; // All these icons are now used

// Import your CSS file
import './SuperAdminDashboard.css'; // Adjust path if necessary

const SuperAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Optionally redirect to login if token is invalid/expired
        // navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>; // Added a class for loading
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
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar_url ? ( // Assuming you might have an avatar URL
              <img src={user.avatar_url} alt="User Avatar" />
            ) : (
              <FaUserCircle className="avatar-icon" />
            )}
          </div>
          <h3 className="user-name">{user?.name || 'Esther Howard'}</h3>
          <p className="user-email">{user?.email || 'esther.howard@example.com'}</p>
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            {/* Added more navigation items to mimic the image */}
            {/* Original management links - integrate them if they are part of the Super Admin context */}
            <li className="nav-item">
                <Link to="/users" className="nav-link">
                    <FaUserCircle className="nav-icon" /> User Management
                </Link>
            </li>
            <li className="nav-item">
                <Link to="/assets" className="nav-link">
                    <FaFileAlt className="nav-icon" /> Asset Management {/* FaFileAlt is now used */}
                </Link>
            </li>
            <li className="nav-item">
                <Link to="/movements" className="nav-link">
                    <FaChartBar className="nav-icon" /> Movement Management {/* FaChartBar is now used */}
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
                        <li className="nav-item">
      <Link to="/reports/movements" className="nav-link">
        <FaFileAlt className="nav-icon" /> Movement Report
      </Link>
    </li>
          </ul>
        </nav>
        {/* Logout Button */}
        <div className="nav-item logout">
            <button onClick={handleLogout} className="nav-link logout-button">
                <FaUserCircle className="nav-icon" /> Log out
            </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* Original Management Sections - You can decide where to place these
            They don't quite fit the image's layout directly, but if they are
            core to your Super Admin functionality, consider making them smaller cards
            or placing them below the "Defi Overview" section.
            For now, I'll keep them as they were, but styled.
        */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;