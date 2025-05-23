import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AddAssets.css'; // Use your AddAsset CSS

const EditAsset = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    purchaseDate: '',
    warranty: '',
    location: '',
    condition: '',
    serialNumber: '',
    assignedTo: '',
    status: '',
    description: ''
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setFormData({
          name: data.name || '',
          type: data.type || '',
          category: data.category || '',
          purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
          warranty: data.warranty || '',
          location: data.location || '',
          condition: data.condition || '',
          serialNumber: data.serialNumber || '',
          assignedTo: data.assignedTo || '',
          status: data.status || '',
          description: data.description || ''
        });
      } catch (err) {
        console.error('Error fetching asset:', err);
        alert('Failed to load asset data.');
      }
    };
    fetchAsset();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/assets/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Asset updated successfully');
      navigate('/assets');
    } catch (err) {
      console.error('Error updating asset:', err);
      alert('Failed to update asset.');
    }
  };

  return (
    <div className="add-asset-container">
      <div className="add-asset-card">
        <h2 className="add-asset-title">Edit Asset</h2>
        <form className="add-asset-form" onSubmit={handleSubmit}>
          <input
            className="add-asset-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            className="add-asset-input"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Type"
            required
          />
          <input
            className="add-asset-input"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            required
          />
          <input
            className="add-asset-input"
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            placeholder="Purchase Date"
            required
          />
          <input
            className="add-asset-input"
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
            placeholder="Warranty"
          />
          <input
            className="add-asset-input"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
          />
          <input
            className="add-asset-input"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            placeholder="Condition"
          />
          <input
            className="add-asset-input"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="Serial Number"
          />
          <input
            className="add-asset-input"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="Assigned To"
          />
          <select
            className="add-asset-select"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="in_repair">In Repair</option>
            <option value="disposed">Disposed</option>
          </select>
          <textarea
            className="add-asset-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <button className="add-asset-button" type="submit">Update Asset</button>
        </form>
      </div>
    </div>
  );
};

export default EditAsset;
