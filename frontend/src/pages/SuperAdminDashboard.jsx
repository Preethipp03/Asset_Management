import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaUserCircle
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    usersCount: 0,
    assetsCount: 0,
    movementsCount: 0,
    maintenanceCount: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState(null);

  const [destinationData, setDestinationData] = useState([]);
  const [maintenanceStatusData, setMaintenanceStatusData] = useState([]);

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

  useEffect(() => {
    const fetchMovementDestinations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/movements', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const movements = res.data;

        const countsMap = {};

        movements.forEach(m => {
          const from = m.movementFrom?.trim() || 'Unknown';
          const to = m.movementTo?.trim() || 'Unknown';

          if (!countsMap[from]) countsMap[from] = { location: from, from: 0, to: 0 };
          countsMap[from].from++;

          if (!countsMap[to]) countsMap[to] = { location: to, from: 0, to: 0 };
          countsMap[to].to++;
        });

        const formatted = Object.values(countsMap).sort((a, b) => (b.from + b.to) - (a.from + a.to));
        setDestinationData(formatted);
      } catch (error) {
        console.error('Error fetching movement data:', error);
      }
    };

    fetchMovementDestinations();
  }, []);

  useEffect(() => {
    const fetchMaintenanceStatuses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/maintenance', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const statusCountMap = {};

        res.data.forEach(item => {
          const status = item.status || 'unknown';
          statusCountMap[status] = (statusCountMap[status] || 0) + 1;
        });

        const formatted = Object.entries(statusCountMap).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }));

        setMaintenanceStatusData(formatted);
      } catch (error) {
        console.error('Error fetching maintenance data:', error);
      }
    };

    fetchMaintenanceStatuses();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#9CCC65'];

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar_url ? (
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
            <li className="nav-item">
              <Link to="/reports/movements" className="nav-link">
                <FaFileAlt className="nav-icon" /> Movement Report
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/reports/maintenance" className="nav-link">
                <FaFileAlt className="nav-icon" /> Maintenance Report
              </Link>
            </li>
          </ul>
        </nav>

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

        {/* CHARTS */}
        <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '30px' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>Top Movement Locations</h3>
            {destinationData.length === 0 ? (
              <p>No movement data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={destinationData} layout="vertical" margin={{ right: 50, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" />
                  <Tooltip />
                  <Bar dataKey="from" fill="#FF7F50" name="Moved From" />
                  <Bar dataKey="to" fill="#4A90E2" name="Moved To" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>Maintenance Status Distribution</h3>
            {maintenanceStatusData.length === 0 ? (
              <p>No maintenance data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={maintenanceStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {maintenanceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
