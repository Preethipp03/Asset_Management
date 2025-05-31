import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MaintenanceList = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMaintenances = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/maintenance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMaintenances(response.data);
    } catch (err) {
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit-maintenance/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this maintenance record?'
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list after delete
      fetchMaintenances();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete maintenance record');
    }
  };

  if (loading) return <p>Loading maintenance records...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Maintenance Records</h2>
      {maintenances.length === 0 ? (
        <p>No maintenance records found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Serial Number</th>
              <th>Type</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Technician (In-House)</th>
              <th>Technician (Vendor)</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((maintenance) => (
              <tr key={maintenance._id}>
                <td>{maintenance.assetName}</td>
                <td>{maintenance.serialNumber}</td>
                <td>{maintenance.maintenanceType}</td>
                <td>{new Date(maintenance.scheduledDate).toLocaleDateString()}</td>
                <td>{maintenance.status}</td>
                <td>{maintenance.technicianInHouse}</td>
                <td>{maintenance.technicianVendor}</td>
                <td>{maintenance.description}</td>
                <td>
                  <button onClick={() => handleEdit(maintenance._id)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(maintenance._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MaintenanceList;
