import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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

  const maintenanceTypeOptions = ['preventive', 'corrective', 'predictive'];
  const statusOptions = ['scheduled', 'in-progress', 'completed', 'cancelled'];

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/maintenance/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const toDateInput = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return d.toISOString().split('T')[0];
        };

        setMaintenanceData({
          assetName: res.data.assetName || '',
          serialNumber: res.data.serialNumber || '',
          maintenanceType: res.data.maintenanceType || 'preventive',
          scheduledDate: toDateInput(res.data.scheduledDate),
          nextScheduledDate: toDateInput(res.data.nextScheduledDate),
          status: res.data.status || 'scheduled',
          technicianInHouse: res.data.technicianInHouse || '',
          technicianVendor: res.data.technicianVendor || '',
          description: res.data.description || '',
        });
      } catch (err) {
        setError('Failed to load maintenance record');
      }
    };

    fetchMaintenance();
  }, [id]);

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

      await axios.put(`http://localhost:5000/maintenance/${id}`, maintenanceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Maintenance record updated successfully!');
      setTimeout(() => {
        navigate('/maintenance'); // change to your list page
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update maintenance record');
    }
  };

  return (
    <div className="edit-maintenance-container">
      <h2>Edit Maintenance Record</h2>

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
            {maintenanceTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
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
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
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

        <button type="submit">Update Maintenance</button>
      </form>
    </div>
  );
};

export default EditMaintenance;
