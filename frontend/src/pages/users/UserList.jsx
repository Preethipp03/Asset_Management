import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://172.16.0.36:5000/users', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    role: filterRole === 'all' ? '' : filterRole,
                },
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    }, [token, searchQuery, filterRole]);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserRole(decoded.role);
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        fetchUsers();
    }, [token, fetchUsers]);

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://172.16.0.36:5000/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    const isRestricted = (userRole) => {
        if (userRole === 'super_admin' && currentUserRole !== 'super_admin') {
            return true;
        }
        if (userRole === 'admin' && (currentUserRole === 'maintenance' || currentUserRole === 'movement')) {
            return true;
        }
        if ((userRole === 'maintenance' || userRole === 'movement') && (currentUserRole !== 'super_admin' && currentUserRole !== 'admin')) {
            return true;
        }
        return false;
    };

    const handleAddUser = () => {
        if (currentUserRole === 'super_admin') {
            navigate('/users/add');
        } else if (currentUserRole === 'admin') {
            navigate('/users/add-user');
        } else {
            alert('You do not have permission to add users.');
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterRole('all');
    };

    // New back button handler to navigate based on user role
    const handleBackToDashboard = () => {
        if (!token) {
            navigate('/'); // no token, go to login
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const role = decoded.role;
            if (role === 'super_admin') {
                navigate('/super-admin');
            } else if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'user') {
                navigate('/user');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/');
        }
    };

    const paginatedUsers = users.slice(0, rowsPerPage);

    return (
        <div className="movement-list-page">
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        <button className="reset-btn" onClick={handleBackToDashboard} style={{ marginRight: '10px' }}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>

                        <button
                            className="add-movement-btn"
                            onClick={handleAddUser}
                            disabled={!['super_admin', 'admin'].includes(currentUserRole)}
                        >
                            <i className="fas fa-plus"></i> Add User
                        </button>

                        <select
                            className="filter-select"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="movement">Movement</option>
                        </select>
                    </div>

                    <div className="header-right">
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="reset-btn" onClick={handleResetFilters}>
                            <i className="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                {loading ? (
                    <div className="loading-message">
                        <i className="fas fa-spinner fa-spin"></i> Loading users...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                ) : paginatedUsers.length === 0 ? (
                    <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No users found.
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((u, index) => (
                                <tr key={u._id}>
                                    <td>{index + 1}</td>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td className="actions-cell">
                                        <Link to={`/users/edit/${u._id}`}>
                                            <button
                                                className="action-btn edit-btn"
                                                disabled={isRestricted(u.role)}
                                                title={isRestricted(u.role) ? "You don't have permission to edit this user" : "Edit User"}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </Link>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => deleteUser(u._id)}
                                            disabled={isRestricted(u.role)}
                                            title={isRestricted(u.role) ? "You don't have permission to delete this user" : "Delete User"}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pagination-controls">
                <div className="rows-per-page-selector">
                    Rows per page:
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn" disabled>Next</button>
            </div>
        </div>
    );
};

export default UserList;
