import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserList.css'; // Import the CSS file

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

  const isRestricted = (role) => role === 'maintenance' || role === 'movement';

  return (
    <div className="user-list-container">
      <div className="user-list-card">
        <div className="user-list-header">
          <h2>Users</h2>
          <Link to="/users/add">
            <button>Add User</button>
          </Link>
        </div>
        <table className="user-table">
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
                    <button disabled={isRestricted(u.role)}>Edit</button>
                  </Link>
                  <button
                    onClick={() => deleteUser(u._id)}
                    disabled={isRestricted(u.role)}
                  >
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
    </div>
  );
};

export default UserList;
