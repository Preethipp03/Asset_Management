import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', location: '', price: '', status: 'available' });
  const [editingId, setEditingId] = useState(null);

  const fetchAssets = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://172.16.0.36:5000/assets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAssets(res.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ name: '', description: '', location: '', price: '', status: 'available' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = { ...formData, price: parseFloat(formData.price) };

    try {
      if (editingId) {
        await axios.put(`http://172.16.0.36:5000/assets/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://172.16.0.36:5000/assets', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchAssets();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving asset');
    }
  };

  const handleEdit = (asset) => {
    setFormData({ ...asset, price: asset.price.toString() });
    setEditingId(asset._id);
  };

  const deleteAsset = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://172.16.0.36:5000/assets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAssets();
  };

  return (
    <div className="asset-container">
      <div className="asset-card">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="asset-title">{editingId ? 'Edit Asset' : 'Add Asset'}</h2>
        <form className="asset-form" onSubmit={handleSubmit}>
          <input className="asset-input" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input className="asset-input" name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          <input className="asset-input" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
          <input className="asset-input" name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" required />
          <select className="asset-select" name="status" value={formData.status} onChange={handleChange}>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="asset-button" type="submit">{editingId ? 'Update' : 'Add'} Asset</button>
          {editingId && <button className="cancel-button" type="button" onClick={resetForm}>Cancel</button>}
        </form>

        <h2 className="asset-title">All Assets</h2>
        <div className="asset-table-wrapper">
          <table className="asset-table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td>{asset.name}</td><td>{asset.location}</td><td>{asset.price}</td><td>{asset.status}</td>
                  <td>
                    <button onClick={() => handleEdit(asset)}>Edit</button>
                    <button onClick={() => deleteAsset(asset._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;
