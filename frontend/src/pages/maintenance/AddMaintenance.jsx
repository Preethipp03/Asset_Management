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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMaintenanceData({
      ...maintenanceData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent multiple submits
    setError('');
    setSuccess('');

    // Validation
    if (!maintenanceData.assetName.trim()) {
      setError('Asset Name is required');
      document.querySelector('input[name="assetName"]').focus();
      return;
    }
    if (!maintenanceData.serialNumber.trim()) {
      setError('Serial Number is required');
      document.querySelector('input[name="serialNumber"]').focus();
      return;
    }
    if (!maintenanceData.scheduledDate) {
      setError('Scheduled Date is required');
      document.querySelector('input[name="scheduledDate"]').focus();
      return;
    }
    if (
      maintenanceData.nextScheduledDate &&
      maintenanceData.nextScheduledDate <= maintenanceData.scheduledDate
    ) {
      setError('Next Scheduled Date must be after Scheduled Date');
      document.querySelector('input[name="nextScheduledDate"]').focus();
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

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
      setError(err.response?.data?.error || 'Failed to add maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-maintenance-container" style={{ maxWidth: 500, margin: 'auto' }}>
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
          <select
            name="maintenanceType"
            value={maintenanceData.maintenanceType}
            onChange={handleChange}
          >
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="predictive">Predictive</option>
          </select>
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
          <select
            name="status"
            value={maintenanceData.status}
            onChange={handleChange}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Maintenance'}
        </button>
      </form>
    </div>
  );
};

export default AddMaintenance;
