import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './UserList.css'; // Ensure this path is correct

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // Filter by user role
    const [rowsPerPage, setRowsPerPage] = useState(10); // For basic pagination control
    const [currentUserRole, setCurrentUserRole] = useState(null); // Renamed to avoid confusion with filterRole
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Memoize fetchUsers using useCallback for performance and to satisfy useEffect dependencies
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:5000/users', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    role: filterRole === 'all' ? '' : filterRole, // Send filter param
                },
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    }, [token, searchQuery, filterRole]); // Dependencies for useCallback

    // Fetch users and decode token on component mount or when dependencies change
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserRole(decoded.role); // Set current user's role
            } catch (err) {
                console.error('Invalid token:', err);
                // Optionally handle invalid token, e.g., redirect to login
            }
        }
        fetchUsers();
    }, [token, fetchUsers]); // fetchUsers is a dependency here, which is memoized

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:5000/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Re-fetch users to update the list after deletion
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    // Determine if a user's role is restricted for editing/deleting by the current user
    const isRestricted = (userRole) => {
        // Prevent deletion/editing of super_admin by anyone but a super_admin
        if (userRole === 'super_admin' && currentUserRole !== 'super_admin') {
            return true;
        }
        // Prevent deletion/editing of admin by maintenance or movement roles
        // FIX: Added parentheses to clarify the order of operations
        if (userRole === 'admin' && (currentUserRole === 'maintenance' || currentUserRole === 'movement')) {
            return true;
        }
        // Prevent deletion/editing of maintenance/movement roles by maintenance/movement roles themselves
        // unless the current user is an admin or super_admin
        // FIX: Added parentheses to clarify the order of operations
        if ((userRole === 'maintenance' || userRole === 'movement') && (currentUserRole !== 'super_admin' && currentUserRole !== 'admin')) {
            return true;
        }
        // Additional condition: A user cannot delete/edit themselves (optional, but good practice)
        // You'd need to get the current user's ID from the token for this.
        // if (user._id === currentUserId) { return true; }

        return false; // Not restricted
    };


    // Handle Add User button click based on current user's role
    const handleAddUser = () => {
        if (currentUserRole === 'super_admin') {
            navigate('/users/add'); // Route for super_admin to add any user
        } else if (currentUserRole === 'admin') {
            navigate('/users/add-user'); // Route for admin to add non-super_admin users
        } else {
            alert('You do not have permission to add users.');
        }
    };

    // Define handleResetFilters function
    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterRole('all');
        // Reset pagination if implemented
        // setPage(1);
    };


    // Simple pagination: slicing the array. For real apps, implement backend pagination.
    const paginatedUsers = users.slice(0, rowsPerPage);

    return (
        <div className="movement-list-page"> {/* Re-using the main page container class */}
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        {/* Add User Button - conditional rendering/disabling based on role */}
                        <button
                            className="add-movement-btn"
                            onClick={handleAddUser}
                            disabled={!['super_admin', 'admin'].includes(currentUserRole)} // Only super_admin/admin can add
                        >
                            <i className="fas fa-plus"></i> Add User
                        </button>

                        {/* Filter by Role */}
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
                            {/* Add other roles as necessary */}
                        </select>
                    </div>

                    <div className="header-right">
                        {/* Search Box */}
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Reset Filters Button */}
                        <button className="reset-btn" onClick={handleResetFilters}>
                            <i className="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content area: table and messages */}
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
                    <table className="data-table"> {/* Applying the data-table class */}
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
                                        {/* Edit Button */}
                                        <Link to={`/users/edit/${u._id}`}>
                                            <button
                                                className="action-btn edit-btn"
                                                disabled={isRestricted(u.role)}
                                                title={isRestricted(u.role) ? "You don't have permission to edit this user" : "Edit User"}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </Link>
                                        {/* Delete Button */}
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

            {/* Pagination Controls */}
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
                {/* Pagination buttons (logic for these is not implemented here, placeholders only) */}
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn" disabled>Next</button>
            </div>
        </div>
    );
};

export default UserList;