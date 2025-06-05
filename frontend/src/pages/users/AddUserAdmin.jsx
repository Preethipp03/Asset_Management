import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddUser.css'; // REMOVE THIS LINE - rely on global CSS

const AddUserAdmin = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState('');     // State for error messages
    const [success, setSuccess] = useState('');   // State for success messages
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');   // Clear previous errors
        setSuccess(''); // Clear previous success messages
        setLoading(true); // Start loading

        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Please fill in all required fields (Name, Email, Password).');
            setLoading(false);
            return;
        }

        // Ensure token exists
        if (!token) {
            setError('You are not authorized. Please log in.');
            setLoading(false);
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            await axios.post(
                'http://172.16.0.36:5000/users',
                { ...formData, role: 'user' }, // Explicitly set role to 'user' for admin-added users
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('User added successfully!');
            // Clear form fields
            setFormData({
                name: '',
                email: '',
                password: '',
            });
            setTimeout(() => navigate('/users'), 1500); // Navigate to users list after success
        } catch (err) {
            console.error('Failed to add user:', err.response?.data || err.message);
            setError('Failed to add user: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="edit-movement-container"> {/* Consistent main container class */}
            <div className="header-with-back-button">
                <button onClick={() => navigate('/users')} className="back-button">
                    &larr; Back to Users
                </button>
                <h2 className="edit-movement-title">Add New User (Admin)</h2> {/* Consistent title class */}
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
                        {loading ? 'Creating User...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUserAdmin;