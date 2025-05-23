import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddUser.css';

const AddUserAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/users',
        { ...formData, role: 'user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/users');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="add-user-container">
      <div className="add-user-card">
        <h2 className="add-user-title">Add User (Admin)</h2>
        <form className="add-user-form" onSubmit={handleSubmit}>
          <input
            className="add-user-input"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="add-user-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="add-user-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="add-user-button">Create User</button>
          <button
          type="button"
          className="add-user-button"
          style={{ marginTop: '10px', background: '#6b7280' }}
          onClick={() => navigate('/admin')}
        >
          Back
        </button>
          {message && <p className="add-user-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddUserAdmin;
