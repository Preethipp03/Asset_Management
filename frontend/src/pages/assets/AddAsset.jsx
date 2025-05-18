import React, { useState } from 'react';
import axios from 'axios';

const AddAsset = () => {
  // 1. Declare state for formData
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
    notes: ''
  });

  // 2. Handle form submission
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
      price: Number(formData.price),
      purchaseDate: formData.purchaseDate,
      warranty: formData.warranty.trim(),
      location: formData.location.trim(),
      condition: formData.condition.trim(),
      serialNumber: formData.serialNumber.trim(),
      assignedTo: formData.assignedTo.trim(),
      notes: formData.notes.trim()
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
        price: '',
        purchaseDate: '',
        warranty: '',
        location: '',
        condition: '',
        serialNumber: '',
        assignedTo: '',
        notes: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add asset');
    }
  };

  // 3. Handle input changes to update formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" required />
      <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
      <input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="Price" required />
      <input name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} type="date" placeholder="Purchase Date" required />
      <input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="Warranty" />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
      <input name="condition" value={formData.condition} onChange={handleChange} placeholder="Condition" />
      <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Serial Number" />
      <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="Assigned To" />
      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" />
      <button type="submit">Add Asset</button>
    </form>
  );
};

export default AddAsset;
