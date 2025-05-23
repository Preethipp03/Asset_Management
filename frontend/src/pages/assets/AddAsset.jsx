import React, { useState } from 'react';
import axios from 'axios';
import './AddAssets.css';

const AddAsset = () => {
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
    description: '',
    status: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      category: formData.category.trim(),
      purchaseDate: formData.purchaseDate,
      warranty: formData.warranty.trim(),
      location: formData.location.trim(),
      condition: formData.condition.trim(),
      serialNumber: formData.serialNumber.trim(),
      assignedTo: formData.assignedTo.trim(),
      description: formData.description.trim(),
      status: formData.status.trim(),
    };

    try {
      await axios.post('http://localhost:5000/assets', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Asset added successfully');
      setFormData({
        name: '',
        type: '',
        category: '',
        purchaseDate: '',
        warranty: '',
        location: '',
        condition: '',
        serialNumber: '',
        assignedTo: '',
        description: '',
        status: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add asset');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-asset-container">
      <div className="add-asset-card">
        <h2 className="add-asset-title">Add Asset</h2>
        <form className="add-asset-form" onSubmit={handleSubmit}>
          <input name="name" className="add-asset-input" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input name="type" className="add-asset-input" value={formData.type} onChange={handleChange} placeholder="Type" required />
          <input name="category" className="add-asset-input" value={formData.category} onChange={handleChange} placeholder="Category" required />
          <input name="purchaseDate" type="date" className="add-asset-input" value={formData.purchaseDate} onChange={handleChange} required />
          <input name="warranty" className="add-asset-input" value={formData.warranty} onChange={handleChange} placeholder="Warranty" />
          <input name="location" className="add-asset-input" value={formData.location} onChange={handleChange} placeholder="Location" />
          <input name="condition" className="add-asset-input" value={formData.condition} onChange={handleChange} placeholder="Condition" />
          <input name="serialNumber" className="add-asset-input" value={formData.serialNumber} onChange={handleChange} placeholder="Serial Number" />
          <input name="assignedTo" className="add-asset-input" value={formData.assignedTo} onChange={handleChange} placeholder="Assigned To" />
          <textarea name="description" className="add-asset-textarea" value={formData.description} onChange={handleChange} placeholder="Description" />
          <select name="status" className="add-asset-select" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="in_repair">In Repair</option>
            <option value="disposed">Disposed</option>
          </select>
          <button type="submit" className="add-asset-button">Add Asset</button>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;
