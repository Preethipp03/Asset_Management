import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// import './AddUser.css'; // REMOVE THIS LINE - rely on global CSS

const AddUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user', // Default role
    });
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState('');     // State for error messages
    const [success, setSuccess] = useState('');   // State for success messages
    const [currentRole, setCurrentRole] = useState(''); // Role of the logged-in user

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Redirect if no token is found (not logged in)
        if (!token) {
            setError('Not authorized. Please log in. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Decode token to determine current user's role and set default new user role
        try {
            const decoded = jwtDecode(token);
            setCurrentRole(decoded.role);
            // Default new user role based on current user's role
            setFormData((prev) => ({
                ...prev,
                role: decoded.role === 'super_admin' ? 'admin' : 'user',
            }));
        } catch (err) {
            console.error('Token decoding failed:', err);
            setError('Authentication error. Please log in again. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages
        setLoading(true); // Start loading

        // Client-side validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Please fill in all required fields (Name, Email, Password).');
            setLoading(false);
            return;
        }

        try {
            await axios.post(
                'http://172.16.0.36:5000/users',
                formData, // formData directly contains name, email, password, role
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSuccess('User added successfully!');
            // Reset form fields after successful submission
            setFormData({
                name: '',
                email: '',
                password: '',
                role: currentRole === 'super_admin' ? 'admin' : 'user', // Reset to default based on current user's role
            });
            setTimeout(() => navigate('/users'), 1500); // Navigate to users list after success
        } catch (err) {
            console.error('Failed to add user:', err.response?.data || err.message);
            setError('Failed to add user: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    // If currentRole is not yet determined or there's a critical error during fetch/auth
    if (!currentRole && !error) {
        return <p className="loading-message">Checking user permissions...</p>;
    }

    return (
        <div className="edit-movement-container"> {/* Consistent container class */}
            <div className="header-with-back-button">
                <button onClick={() => navigate('/users')} className="back-button">
                    &larr; Back to Users
                </button>
                <h2 className="edit-movement-title">Add New User</h2> {/* Consistent title class */}
            </div>

            {/* Display error and success messages */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form className="edit-movement-form" onSubmit={handleSubmit}> {/* Consistent form grid class */}
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        className="form-control" // Consistent input class
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        className="form-control"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        className="form-control"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}> {/* Spans all columns */}
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        className="form-control" // Consistent select class
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        {/* Super Admin can create Super Admin, Admin, or User */}
                        {currentRole === 'super_admin' && (
                            <>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </>
                        )}
                        {/* Admin can only create Users */}
                        {currentRole === 'admin' && (
                            <option value="user">User</option>
                        )}
                        {/* Normal User role cannot add users */}
                        {/* If a 'user' somehow lands here, they won't see options to add higher roles */}
                    </select>
                </div>

                <div className="form-actions"> {/* Consistent actions container */}
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
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUser;