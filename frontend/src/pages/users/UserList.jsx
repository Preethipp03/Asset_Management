import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        alert('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, [token]);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      alert('Failed to delete user.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Users</h2>
      <Link to="/users/add">
        <button>Add User</button>
      </Link>
      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%', maxWidth: 600 }}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <Link to={`/users/edit/${u._id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => deleteUser(u._id)} style={{ marginLeft: '10px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No users found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
