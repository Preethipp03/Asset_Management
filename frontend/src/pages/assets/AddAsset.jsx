import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
// import './AddAssets.css'; // REMOVE THIS LINE - rely on global CSS

const AddAsset = () => {
    const navigate = useNavigate(); // Initialize navigate hook
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        category: '',
        purchaseDate: '',
        warranty: '',
        location: '',
        condition: '',
        serialNumber: '',
        assignedTo: '',
        description: '',
        status: ''
    });
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState('');     // State for error messages
    const [success, setSuccess] = useState('');   // State for success messages

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages
        setLoading(true); // Start loading

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to add an asset. Redirecting to login...');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Basic client-side validation for required fields
        if (!formData.name.trim() ||
            !formData.type.trim() ||
            !formData.category.trim() ||
            !formData.purchaseDate.trim() ||
            !formData.status.trim()) {
            setError('Please fill in all required fields: Name, Type, Category, Purchase Date, and Status.');
            setLoading(false);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            type: formData.type.trim(),
            category: formData.category.trim(),
            // Ensure date is sent as a proper Date object or ISO string if your backend expects it
            purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
            warranty: formData.warranty.trim(),
            location: formData.location.trim(),
            condition: formData.condition.trim(),
            serialNumber: formData.serialNumber.trim(),
            assignedTo: formData.assignedTo.trim(),
            description: formData.description.trim(),
            status: formData.status.trim(),
        };

        try {
            await axios.post('http://172.16.0.36:5000/assets', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess('Asset added successfully!');
            // Reset form fields after successful submission
            setFormData({
                name: '',
                type: '',
                category: '',
                purchaseDate: '',
                warranty: '',
                location: '',
                condition: '',
                serialNumber: '',
                assignedTo: '',
                description: '',
                status: ''
            });
            setTimeout(() => navigate('/assets'), 1500); // Navigate to assets list after success
        } catch (err) {
            console.error('Failed to add asset:', err.response?.data || err.message);
            setError('Failed to add asset: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="edit-movement-container"> {/* Reusing the consistent container class */}
            <div className="header-with-back-button">
                <button onClick={() => navigate('/assets')} className="back-button">
                    &larr; Back to Assets
                </button>
                <h2 className="edit-movement-title">Add New Asset</h2> {/* Reusing the consistent title class */}
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form className="edit-movement-form" onSubmit={handleSubmit}> {/* Reusing the consistent form grid class */}
                <div className="form-group">
                    <label htmlFor="name">Asset Name:</label>
                    <input id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="e.g., Laptop, Projector" required />
                </div>

                <div className="form-group">
                    <label htmlFor="type">Type:</label>
                    <input id="type" name="type" className="form-control" value={formData.type} onChange={handleChange} placeholder="e.g., Electronic, Furniture" required />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input id="category" name="category" className="form-control" value={formData.category} onChange={handleChange} placeholder="e.g., IT Equipment, Office Supplies" required />
                </div>

                <div className="form-group">
                    <label htmlFor="purchaseDate">Purchase Date:</label>
                    <input id="purchaseDate" name="purchaseDate" type="date" className="form-control" value={formData.purchaseDate} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="warranty">Warranty (Years):</label>
                    <input id="warranty" name="warranty" type="text" className="form-control" value={formData.warranty} onChange={handleChange} placeholder="e.g., 2 years" />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input id="location" name="location" className="form-control" value={formData.location} onChange={handleChange} placeholder="e.g., Office A, Storeroom" />
                </div>

                <div className="form-group">
                    <label htmlFor="condition">Condition:</label>
                    <input id="condition" name="condition" className="form-control" value={formData.condition} onChange={handleChange} placeholder="e.g., New, Good, Fair" />
                </div>

                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input id="serialNumber" name="serialNumber" className="form-control" value={formData.serialNumber} onChange={handleChange} placeholder="e.g., SN123456789" />
                </div>

                <div className="form-group">
                    <label htmlFor="assignedTo">Assigned To:</label>
                    <input id="assignedTo" name="assignedTo" className="form-control" value={formData.assignedTo} onChange={handleChange} placeholder="e.g., John Doe, Dept. X" />
                </div>

                {/* Description and Status fields will span all columns */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea id="description" name="description" className="form-control description-textarea" value={formData.description} onChange={handleChange} placeholder="Additional details about the asset..." rows={3} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="status">Status:</label>
                    <select id="status" name="status" className="form-control" value={formData.status} onChange={handleChange} required>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="in_repair">In Repair</option>
                        <option value="disposed">Disposed</option>
                    </select>
                </div>

                <div className="form-actions"> {/* Reusing the consistent actions container */}
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
                        className="cancel-button" // Reusing the consistent cancel button class
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button" // Reusing the consistent submit button class
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAsset;