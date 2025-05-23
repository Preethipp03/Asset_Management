import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddMaintenance.css';

const AddMaintenance = () => {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetId: '',
    maintenanceType: 'preventive',
    scheduledDate: '',
    frequency: 'monthly',
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

  useEffect(() => {
    if (form.scheduledDate && form.frequency) {
      const scheduled = new Date(form.scheduledDate);
      let nextDate = new Date(scheduled);
      if (form.frequency === 'weekly') nextDate.setDate(scheduled.getDate() + 7);
      else if (form.frequency === 'monthly') nextDate.setMonth(scheduled.getMonth() + 1);
      else if (form.frequency === 'quarterly') nextDate.setMonth(scheduled.getMonth() + 3);

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
    <div className="add-maintenance-container">
      <div className="add-maintenance-card">
        <h2 className="add-maintenance-title">Schedule Maintenance</h2>
        <form className="add-maintenance-form" onSubmit={handleSubmit}>
          <select className="add-maintenance-select" name="assetId" value={form.assetId} onChange={handleChange} required>
            <option value="">-- Select Asset --</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>

          <select className="add-maintenance-select" name="maintenanceType" value={form.maintenanceType} onChange={handleChange} required>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>

          <input
            className="add-maintenance-input"
            type="date"
            name="scheduledDate"
            value={form.scheduledDate}
            onChange={handleChange}
            required
          />

          <select className="add-maintenance-select" name="frequency" value={form.frequency} onChange={handleChange} required>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>

          {form.nextMaintenanceDate && (
            <div className="next-date-display">
              Next Maintenance: {form.nextMaintenanceDate}
            </div>
          )}

          <select className="add-maintenance-select" name="status" value={form.status} onChange={handleChange} required>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <input
            className="add-maintenance-input"
            type="text"
            name="performedBy"
            value={form.performedBy}
            onChange={handleChange}
            placeholder="Technician Name"
            required
          />

          <textarea
            className="add-maintenance-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
          />

          <button type="submit" className="add-maintenance-button">Add</button>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenance;
