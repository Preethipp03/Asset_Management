import React, { useState } from 'react';
import axios from 'axios';

const AddMaintenance = () => {
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

  const handleChange = (e) => {
    setMaintenanceData({
      ...maintenanceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation example
    if (!maintenanceData.assetName.trim()) {
      setError('Asset Name is required');
      return;
    }
    if (!maintenanceData.serialNumber.trim()) {
      setError('Serial Number is required');
      return;
    }
    if (!maintenanceData.scheduledDate) {
      setError('Scheduled Date is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in.');
        return;
      }

      // Make API call to backend
      await axios.post('http://localhost:5000/maintenance', maintenanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Maintenance record added successfully!');
      setMaintenanceData({
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
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to add maintenance record'
      );
    }
  };

  return (
    <div className="add-maintenance-container">
      <h2>Add Maintenance Record</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Asset Name:
          <input
            type="text"
            name="assetName"
            value={maintenanceData.assetName}
            onChange={handleChange}
          />
        </label>

        <label>
          Serial Number:
          <input
            type="text"
            name="serialNumber"
            value={maintenanceData.serialNumber}
            onChange={handleChange}
          />
        </label>

        <label>
          Maintenance Type:
          <input
            type="text"
            name="maintenanceType"
            value={maintenanceData.maintenanceType}
            onChange={handleChange}
          />
        </label>

        <label>
          Scheduled Date:
          <input
            type="date"
            name="scheduledDate"
            value={maintenanceData.scheduledDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Next Scheduled Date:
          <input
            type="date"
            name="nextScheduledDate"
            value={maintenanceData.nextScheduledDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Status:
          <input
            type="text"
            name="status"
            value={maintenanceData.status}
            onChange={handleChange}
          />
        </label>

        <label>
          Technician In-House:
          <input
            type="text"
            name="technicianInHouse"
            value={maintenanceData.technicianInHouse}
            onChange={handleChange}
          />
        </label>

        <label>
          Technician Vendor:
          <input
            type="text"
            name="technicianVendor"
            value={maintenanceData.technicianVendor}
            onChange={handleChange}
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={maintenanceData.description}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Add Maintenance</button>
      </form>
    </div>
  );
};

export default AddMaintenance;
