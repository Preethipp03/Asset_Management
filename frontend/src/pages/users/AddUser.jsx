import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './AddUser.css'; // ✅ Make sure this matches your folder structure

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentRole(decoded.role);
        setFormData((prev) => ({
          ...prev,
          role: decoded.role === 'super_admin' ? 'admin' : 'user',
        }));
      } catch (err) {
        console.error('Token decoding failed:', err);
      }
    }
  }, [token]);

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
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate('/users');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="add-user-container">
      <div className="add-user-card">
        <h2 className="add-user-title">Add User</h2>
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
          <select
            className="add-user-input"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            {currentRole === 'super_admin' && (
              <>
                <option className="add-user-input" placeholder="Select" value="super_admin">Super Admin</option>
                <option className="add-user-input" placeholder="Select" value="admin">Admin</option>
                
              </>
            )}
            {(currentRole === 'super_admin' || currentRole === 'admin') && (
              <option className="add-user-input" placeholder="Select" value="user">User</option>
            )}
          </select>

          <button type="submit" className="add-user-button">Create User</button>
          {message && <p className="add-user-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddUser;
