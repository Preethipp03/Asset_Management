import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'admin' });
    setEditingUserId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      if (editingUserId) {
        const updateData = { ...formData };
        if (!formData.password) delete updateData.password;

        await axios.put(`http://localhost:5000/users/${editingUserId}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ User updated successfully!');
      } else {
        await axios.post('http://localhost:5000/users', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ User created successfully!');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      setMessage(`❌ ${msg}`);
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setEditingUserId(user._id);
    setMessage('');
  };

  const deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      alert('User deleted successfully');
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  return (
    <div>
      <h3>{editingUserId ? 'Edit User' : 'Create Admin/User'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required /><br />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required /><br />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={editingUserId ? 'Leave blank to keep password' : 'Password'} /><br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select><br />
        <button type="submit">{editingUserId ? 'Update User' : 'Create User'}</button>
        {editingUserId && <button onClick={resetForm}>Cancel</button>}
      </form>
      {message && <p>{message}</p>}

      <h3>All Users</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td><td>{user.email}</td><td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
