import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        console.error('Error fetching maintenance data:', error);
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
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      alert('Failed to delete maintenance record');
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
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <h2>Maintenance Records</h2>

      <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <label>
          Status:{' '}
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          Type:{' '}
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Search by asset or technician"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '5px', minWidth: '250px' }}
        />

        <button
          onClick={() => {
            setFilter({ status: '', type: '' });
            setSearchTerm('');
          }}
          style={{
            cursor: 'pointer',
            padding: '6px 12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <p>Loading maintenance records...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9f9f9' }}>
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
              filtered.map((item) => (
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
                      <button type="button">Edit</button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      style={{ marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  {maintenance.length > 0 ? 'No records match the current filters.' : 'No maintenance records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MaintenanceList;
