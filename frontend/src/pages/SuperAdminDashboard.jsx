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

  // New states for counts
  const [counts, setCounts] = useState({
    usersCount: 0,
    assetsCount: 0,
    movementsCount: 0,
    maintenanceCount: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(null);

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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        setCountsError(null);

        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/dashboard/counts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCounts(res.data);
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        setCountsError('Failed to load counts');
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
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
        <div className="dashboard-cards">
          {countsLoading ? (
            <div>Loading counts...</div>
          ) : countsError ? (
            <div className="error-message">{countsError}</div>
          ) : (
            <>
              <div className="card users-card">
                <h3>Total Users</h3>
                <p>{counts.usersCount}</p>
              </div>
              <div className="card assets-card">
                <h3>Total Assets</h3>
                <p>{counts.assetsCount}</p>
              </div>
              <div className="card movements-card">
                <h3>Total Movements</h3>
                <p>{counts.movementsCount}</p>
              </div>
              <div className="card maintenance-card">
                <h3>Total Maintenance</h3>
                <p>{counts.maintenanceCount}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
