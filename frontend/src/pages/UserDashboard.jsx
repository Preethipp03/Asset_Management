import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './SuperAdminDashboard.css';

import {
  FaUserCircle,
  FaChartBar,
  FaCog,
  FaFileAlt,
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
  Legend,
} from 'recharts';

const COLORS = ['#FF7F50', '#4A90E2', '#90EE90', '#d9534f'];

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

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

    // This is for your requested movementTypeData for simple horizontal bar chart
    const [movementTypeData, setMovementTypeData] = useState([]);

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

        if (roleFromToken !== 'user' && roleFromToken !== 'admin' && roleFromToken !== 'super_admin') {
          navigate('/unauthorized');
          return;
        }

        setRole(roleFromToken);

        const res = await axios.get('http://172.16.0.36:5000/api/profile', {
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        setCountsError(null);

        const token = localStorage.getItem('token');
        const res = await axios.get('http://172.16.0.36:5000/dashboard/counts', {
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
        const res = await axios.get('http://172.16.0.36:5000/movements', {
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

  // Fetch maintenance status data for PieChart
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://172.16.0.36:5000/maintenance', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const statusMap = {
          scheduled: 0,
          'in-progress': 0,
          completed: 0,
          cancelled: 0,
        };

        res.data.forEach(item => {
          const status = item.status?.toLowerCase();
          if (statusMap[status] !== undefined) {
            statusMap[status]++;
          }
        });

        const formatted = Object.entries(statusMap).map(([status, value]) => ({
          name: status,
          value
        }));

        setMaintenanceStatusData(formatted);
      } catch (error) {
        console.error('Error fetching maintenance status data:', error);
      }
    };

    fetchMaintenanceData();
  }, []);

// New: Fetch data for your simple Movement Type horizontal bar chart
  useEffect(() => {
    const fetchMovementTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://172.16.0.36:5000/movements', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Count total movements by movementType
        const typeCounts = {};

        res.data.forEach(m => {
          const type = m.movementType || 'Unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const formatted = Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count
        }));

        setMovementTypeData(formatted);
      } catch (error) {
        console.error('Error fetching movement type data:', error);
      }
    };

    fetchMovementTypes();
  }, []);


  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
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
          {(role === 'admin' || role === 'super_admin') && (
            <span className="profile-pro-badge">Admin View</span>
          )}
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                <FaCog className="nav-icon" /> Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/assets" className="nav-link">
                <FaFileAlt className="nav-icon" /> Asset Management
              </Link>
            </li>
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
        <div className="dashboard-cards">
          {countsLoading ? (
            <div>Loading counts...</div>
          ) : countsError ? (
            <div className="error-message">{countsError}</div>
          ) : (
            <>
              <div className="card assets-card">
                <h2>Total Assets</h2>
                <p>{counts.assetsCount}</p>
              </div>
              <div className="card movements-card">
                <h2>Total Movements</h2>
                <p>{counts.movementsCount}</p>
              </div>
              <div className="card maintenance-card">
                <h2>Total Maintenance</h2>
                <p>{counts.maintenanceCount}</p>
              </div>
            </>
          )}
        </div>

       {/* Charts Section */}
              <div className="charts-container" style={{ display: 'flex', gap: '2rem', marginTop: '30px', flexWrap: 'wrap' }}>
                {/* Bar Chart */}
                <div style={{ flex: 1, minWidth: '400px' }}>
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
      
                {/* Pie Chart */}
                <div style={{ flex: 1, minWidth: '400px' }}>
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
                          outerRadius={100}
                          label
                        >
                          {maintenanceStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
               <div style={{ marginTop: '40px' }}>
                        <h3>Movement Type Distribution</h3>
                        {movementTypeData.length === 0 ? (
                          <p>No movement type data available.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={100}>
                            <BarChart data={movementTypeData} layout="vertical" margin={{ left: 80, right:100 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="type" type="category" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
      </div>
    </div>
  );
};

export default UserDashboard;
