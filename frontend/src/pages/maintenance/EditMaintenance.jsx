import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceType: '',
    scheduledDate: '',
    frequency: 'monthly',   // Changed from maintenanceFrequency to frequency
    nextMaintenanceDate: '',
    status: '',
    performedBy: '',
    description: ''
  });

  // Fetch assets and maintenance details
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/assets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssets(res.data);
      } catch (err) {
        console.error('Failed to fetch assets:', err);
      }
    };

    const fetchMaintenance = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/maintenance/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setFormData({
          assetId: data.assetId || '',
          maintenanceType: data.maintenanceType || '',
          scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
          frequency: data.frequency || 'monthly',  // Updated here as well
          nextMaintenanceDate: data.nextMaintenanceDate ? data.nextMaintenanceDate.split('T')[0] : '',
          status: data.status || '',
          performedBy: data.performedBy || '',
          description: data.description || ''
        });
      } catch (error) {
        console.error('Error loading maintenance:', error);
        alert('Failed to load maintenance data.');
      }
    };

    if (token) {
      fetchAssets();
      fetchMaintenance();
    }
  }, [id, token]);

  // Update nextMaintenanceDate whenever scheduledDate or frequency changes
  useEffect(() => {
    if (formData.scheduledDate && formData.frequency) {
      const scheduled = new Date(formData.scheduledDate);
      let nextDate = new Date(scheduled);

      if (formData.frequency === 'weekly') {
        nextDate.setDate(scheduled.getDate() + 7);
      } else if (formData.frequency === 'monthly') {
        nextDate.setMonth(scheduled.getMonth() + 1);
      } else if (formData.frequency === 'quarterly') {
        nextDate.setMonth(scheduled.getMonth() + 3);
      }

      const formatted = nextDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, nextMaintenanceDate: formatted }));
    }
  }, [formData.scheduledDate, formData.frequency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/maintenance/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Maintenance record updated successfully.');
      navigate('/maintenance');
    } catch (error) {
      console.error('Error updating maintenance:', error);
      alert('Failed to update maintenance record.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Edit Maintenance</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>
          Asset:
          <select name="assetId" value={formData.assetId} onChange={handleChange} required>
            <option value="">-- Select Asset --</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Maintenance Type:
          <select name="maintenanceType" value={formData.maintenanceType} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>
        </label>

        <label>
          Scheduled Date:
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Frequency:
          <select name="frequency" value={formData.frequency} onChange={handleChange} required>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>

        {formData.nextMaintenanceDate && (
          <div>
            <strong>Next Maintenance Date:</strong> {formData.nextMaintenanceDate}
          </div>
        )}

        <label>
          Status:
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          Performed By (Technician):
          <input
            type="text"
            name="performedBy"
            value={formData.performedBy}
            onChange={handleChange}
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Update Maintenance
        </button>
      </form>
    </div>
  );
};

export default EditMaintenance;
