import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AddMaintenance.css'; // Reusing same CSS file

const MaintenanceList = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMaintenance = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/maintenance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaintenance(res.data);
      } catch (error) {
        alert('Failed to fetch maintenance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, [token]);

  useEffect(() => {
    let data = [...maintenance];
    if (filter.status) {
      data = data.filter(item => item.status === filter.status);
    }
    if (filter.type) {
      data = data.filter(item => item.maintenanceType === filter.type);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item =>
        (item.assetName?.toLowerCase().includes(term)) ||
        (item.performedBy?.toLowerCase().includes(term))
      );
    }
    setFiltered(data);
  }, [filter, maintenance, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      await axios.delete(`http://localhost:5000/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenance(prev => prev.filter(m => m._id !== id));
    } catch {
      alert('Failed to delete maintenance record.');
    }
  };

  const calculateNextDate = (scheduledDate, frequency) => {
    if (!scheduledDate || !frequency) return '-';
    const date = new Date(scheduledDate);
    if (frequency === 'weekly') date.setDate(date.getDate() + 7);
    else if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString();
  };

  return (
    <div className="user-list-container">
      <div className="user-list-card">
        <div className="user-list-header">
          <h2>Maintenance Records</h2>
          <Link to="/maintenance/add">
            <button>Add Maintenance</button>
          </Link>
        </div>

        {/* Filters with simple selects and input styled inline */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: 140 }}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: 140 }}
          >
            <option value="">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>

          <input
            type="text"
            placeholder="Search by asset or technician"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: 220, flexGrow: 1 }}
          />

          <button
            onClick={() => {
              setFilter({ status: '', type: '' });
              setSearchTerm('');
            }}
            style={{ backgroundColor: '#e74c3c', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <p>Loading maintenance records...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Technician</th>
                <th>Scheduled Date</th>
                <th>Next Maintenance</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item._id}>
                    <td>{item.assetName || 'Unknown'}</td>
                    <td>{item.maintenanceType}</td>
                    <td>{item.performedBy || '-'}</td>
                    <td>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                    <td>{calculateNextDate(item.scheduledDate, item.frequency)}</td>
                    <td>{item.status}</td>
                    <td>{item.description || '-'}</td>
                    <td>
                      <Link to={`/maintenance/edit/${item._id}`}>
                        <button>Edit</button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={{ marginLeft: 10, backgroundColor: '#e74c3c' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>
                    {maintenance.length > 0
                      ? 'No records match the current filters.'
                      : 'No maintenance records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MaintenanceList;
