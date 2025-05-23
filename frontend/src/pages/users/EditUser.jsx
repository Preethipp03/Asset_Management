import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditUser.css';

const EditUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, role } = res.data;
        setFormData({ name, email, password: '', role });
      } catch {
        alert('Failed to fetch user data');
      }
    };
    fetchUser();
  }, [id, token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      await axios.put(`http://localhost:5000/users/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/users');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <div className="edit-user-container">
      <div className="edit-user-card">
        <h2 className="edit-user-title">Edit User</h2>
        <form onSubmit={handleSubmit} className="edit-user-form">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="edit-user-input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="edit-user-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Leave blank to keep current password"
            value={formData.password}
            onChange={handleChange}
            className="edit-user-input"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="edit-user-input"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button type="submit" className="edit-user-button">Update User</button>
        </form>
        {message && <p className="edit-user-message">{message}</p>}
      </div>
    </div>
  );
};

export default EditUser;
