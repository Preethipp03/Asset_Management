import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /><br /><br />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Leave blank to keep current password"
          value={formData.password}
          onChange={handleChange}
        /><br /><br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="admin">Admin</option>
<option value="user">User</option>
</select><br /><br />
<button type="submit">Update User</button>
</form>
{message && <p>{message}</p>}
</div>
);
};

export default EditUser;
