import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', location: '', price: '', status: 'available' });
  const [editingId, setEditingId] = useState(null);

  const fetchAssets = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/assets', {
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
        await axios.put(`http://localhost:5000/assets/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/assets', data, {
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
    await axios.delete(`http://localhost:5000/assets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAssets();
  };

  return (
    <div>
      <h3>{editingId ? 'Edit Asset' : 'Add Asset'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required /><br />
        <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" required /><br />
        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required /><br />
        <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" required /><br />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select><br />
        <button type="submit">{editingId ? 'Update' : 'Add'} Asset</button>
        {editingId && <button onClick={resetForm}>Cancel</button>}
      </form>

      <h3>All Assets</h3>
      <table border="1" cellPadding="6">
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
  );
};

export default AssetManagement;
