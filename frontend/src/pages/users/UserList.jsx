import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // <-- Import this
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState(null); // <-- Add this state
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Decode token to get role
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error('Invalid token');
      }
    }

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

  // Replaces the static Add User button
  const handleAddUser = () => {
    if (role === 'super_admin') {
      navigate('/users/add');
    } else if (role === 'admin') {
      navigate('/users/add-user');
    }
  };

  return (
    <div className="user-list-container">
      <div className="user-list-card">
        <div className="user-list-header">
          <h2>Users</h2>
          <button onClick={handleAddUser}>Add User</button> {/* Replaced Link */}
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
