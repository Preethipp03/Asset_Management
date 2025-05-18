import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditAsset = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    price: '',
    purchaseDate: '',
    warranty: '',
    location: '',
    condition: '',
    serialNumber: '',
    assignedTo: '',
    status: '',
    notes: ''
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
          price: data.price || '',
          purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
          warranty: data.warranty || '',
          location: data.location || '',
          condition: data.condition || '',
          serialNumber: data.serialNumber || '',
          assignedTo: data.assignedTo || '',
          status:data.status || '',
          notes: data.notes || ''
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
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" required />
      <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
      <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required />
      <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} placeholder="Purchase Date" required />
      <input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="Warranty" />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
      <input name="condition" value={formData.condition} onChange={handleChange} placeholder="Condition" />
      <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Serial Number" />
      <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="Assigned To" />
      <select name="status" value={formData.status} onChange={handleChange} required>
        <option value="">Select Status</option>
        <option value="active">Active</option>
        <option value="in_repair">In Repair</option>
        <option value="disposed">Disposed</option>
      </select>
      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" />
      <button type="submit">Update Asset</button>
    </form>
  );
};

export default EditAsset;
