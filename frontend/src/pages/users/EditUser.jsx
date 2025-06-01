import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddUser.css'; // REMOVE THIS LINE - rely on global CSS

const EditUser = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' }); // Initialize role as empty string
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [fetching, setFetching] = useState(true); // State for initial data fetching
    const [error, setError] = useState('');     // State for error messages
    const [success, setSuccess] = useState('');   // State for success messages
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Redirect if no token or invalid ID
        if (!token) {
            setError('You are not authorized. Please log in. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (!id) {
            setError('Invalid user ID. Redirecting...');
            setTimeout(() => navigate('/users'), 2000);
            return;
        }

        setFetching(true);
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { name, email, role } = res.data;
                // Set role as fetched from backend, not hardcoded to 'admin'
                setFormData({ name: name || '', email: email || '', password: '', role: role || 'user' });
                setError(''); // Clear any previous errors on successful fetch
            } catch (err) {
                console.error('Error fetching user:', err.response?.data || err.message);
                setError('Failed to fetch user data. Redirecting...');
                setTimeout(() => navigate('/users'), 2000);
            } finally {
                setFetching(false); // End fetching
            }
        };
        fetchUser();
    }, [id, token, navigate]); // Added navigate to dependency array

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages
        setLoading(true); // Start loading

        // Client-side validation
        if (!formData.name.trim() || !formData.email.trim()) {
            setError('Name and Email cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            const updateData = { ...formData };
            if (!updateData.password.trim()) { // Only send password if it's not empty
                delete updateData.password;
            }

            await axios.put(`http://localhost:5000/users/${id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('User updated successfully!');
            setTimeout(() => navigate('/users'), 1500); // Navigate after a short delay
        } catch (err) {
            console.error('Error updating user:', err.response?.data || err.message);
            setError('Failed to update user: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    if (fetching) {
        return <p className="loading-message">Loading user data...</p>;
    }

    // Display critical errors that lead to redirection
    if (error && (error.includes('Invalid user ID') || error.includes('Not authorized') || error.includes('Failed to fetch user data'))) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="edit-movement-container"> {/* Consistent main container class */}
            <div className="header-with-back-button">
                <button onClick={() => navigate('/users')} className="back-button">
                    &larr; Back to Users
                </button>
                <h2 className="edit-movement-title">Edit User</h2> {/* Consistent title class */}
            </div>

            {/* Display error and success messages */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit} className="edit-movement-form"> {/* Consistent form grid class */}
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control" // Consistent input class
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">New Password:</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Leave blank to keep current password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-control" // Consistent select class
                    >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>

                <div className="form-actions" style={{ gridColumn: '1 / -1' }}> {/* Consistent actions container, spans all columns */}
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="cancel-button" // Consistent cancel button class
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button" // Consistent submit button class
                        disabled={loading}
                    >
                        {loading ? 'Updating User...' : 'Update User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUser;