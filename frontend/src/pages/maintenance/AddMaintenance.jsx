import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddMaintenance = () => {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetId: '',
    maintenanceType: 'preventive',
    scheduledDate: '',
    frequency: 'monthly',          // Changed from maintenanceFrequency -> frequency
    nextMaintenanceDate: '',
    status: 'scheduled',
    performedBy: '',
    description: '',
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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
    if (token) fetchAssets();
  }, [token]);

  // Auto-calculate next maintenance date
  useEffect(() => {
    if (form.scheduledDate && form.frequency) {
      const scheduled = new Date(form.scheduledDate);
      let nextDate;

      if (form.frequency === 'weekly') {
        nextDate = new Date(scheduled);
        nextDate.setDate(scheduled.getDate() + 7);
      } else if (form.frequency === 'monthly') {
        nextDate = new Date(scheduled);
        nextDate.setMonth(scheduled.getMonth() + 1);
      } else if (form.frequency === 'quarterly') {
        nextDate = new Date(scheduled);
        nextDate.setMonth(scheduled.getMonth() + 3);
      }

      const formatted = nextDate.toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, nextMaintenanceDate: formatted }));
    }
  }, [form.scheduledDate, form.frequency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/maintenance', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/maintenance');
    } catch (err) {
      console.error('Failed to add maintenance:', err.response?.data || err.message);
      alert('Error adding maintenance: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 600, margin: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <h2>Schedule Maintenance</h2>

      <label>
        Select Asset:
        <select name="assetId" value={form.assetId} onChange={handleChange} required>
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
        <select name="maintenanceType" value={form.maintenanceType} onChange={handleChange} required>
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
        </select>
      </label>

      <label>
        Scheduled Date:
        <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} required />
      </label>

      <label>
        Frequency:
        <select name="frequency" value={form.frequency} onChange={handleChange} required>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </label>

      {form.nextMaintenanceDate && (
        <div>
          <strong>Next Maintenance Date:</strong> {form.nextMaintenanceDate}
        </div>
      )}

      <label>
        Status:
        <select name="status" value={form.status} onChange={handleChange} required>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label>
        Technician:
        <input
          type="text"
          name="performedBy"
          value={form.performedBy}
          onChange={handleChange}
          required
          placeholder="Technician Name"
        />
      </label>

      <label>
        Description:
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description (optional)"
        />
      </label>

      <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
        Add
      </button>
    </form>
  );
};

export default AddMaintenance;
