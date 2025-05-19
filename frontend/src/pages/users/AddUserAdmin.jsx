import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddUserAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // no role in form data, fixed to 'user'
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData(prev => ({
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
        { ...formData, role: 'user' }, // force role to user
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/users');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: 400 }}>
      <h2>Add User (Admin)</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />

        {/* No role dropdown here, role is fixed to 'user' */}

        <button type="submit" style={{ padding: '10px 20px' }}>Create User</button>
      </form>
      {message && <p style={{ marginTop: 10, color: 'red' }}>{message}</p>}
    </div>
  );
};

export default AddUserAdmin;
