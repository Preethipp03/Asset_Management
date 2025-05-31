import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maintenanceData, setMaintenanceData] = useState({
    assetName: '',
    serialNumber: '',
    maintenanceType: 'preventive',
    scheduledDate: '',
    nextScheduledDate: '',
    status: 'scheduled',
    technicianInHouse: '',
    technicianVendor: '',
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/maintenance/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setMaintenanceData({
          assetName: data.assetName || '',
          serialNumber: data.serialNumber || '',
          maintenanceType: data.maintenanceType || 'preventive',
          scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
          nextScheduledDate: data.nextScheduledDate ? data.nextScheduledDate.split('T')[0] : '',
          status: data.status || 'scheduled',
          technicianInHouse: data.technicianInHouse || '',
          technicianVendor: data.technicianVendor || '',
          description: data.description || '',
        });
      } catch (err) {
        setError('Failed to fetch maintenance data');
      }
    };

    fetchMaintenance();
  }, [id]);

  const handleChange = (e) => {
    setMaintenanceData({ ...maintenanceData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/maintenance/${id}`, maintenanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Maintenance record updated successfully!');
      navigate('/maintenance-list'); // Redirect after successful update
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to update maintenance record'
      );
    }
  };

  return (
    <div>
      <h2>Edit Maintenance</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="assetName"
          placeholder="Asset Name"
          value={maintenanceData.assetName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="serialNumber"
          placeholder="Serial Number"
          value={maintenanceData.serialNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="maintenanceType"
          placeholder="Maintenance Type"
          value={maintenanceData.maintenanceType}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="scheduledDate"
          placeholder="Scheduled Date"
          value={maintenanceData.scheduledDate}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="nextScheduledDate"
          placeholder="Next Scheduled Date"
          value={maintenanceData.nextScheduledDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={maintenanceData.status}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="technicianInHouse"
          placeholder="Technician In-House"
          value={maintenanceData.technicianInHouse}
          onChange={handleChange}
        />
        <input
          type="text"
          name="technicianVendor"
          placeholder="Technician Vendor"
          value={maintenanceData.technicianVendor}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={maintenanceData.description}
          onChange={handleChange}
        />
        <button type="submit">Update Maintenance</button>
      </form>
    </div>
  );
};

export default EditMaintenance;
