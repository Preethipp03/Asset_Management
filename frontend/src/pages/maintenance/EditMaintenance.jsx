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
    status: '',
    performedBy: '',
    description: ''  // changed from description to description
  });

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
          assetId: data.assetId || '',  // expect assetId here
          maintenanceType: data.maintenanceType || '',
          scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
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
    <div>
      <h2>Edit Maintenance</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Asset:</label>
          <select
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Asset --</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Maintenance Type:</label>
          <select
            name="maintenanceType"
            value={formData.maintenanceType}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
          </select>
        </div>

        <div>
          <label>Scheduled Date:</label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label>Performed By (Technician):</label>
          <input
            type="text"
            name="performedBy"
            value={formData.performedBy}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit">Update Maintenance</button>
      </form>
    </div>
  );
};

export default EditMaintenance;
