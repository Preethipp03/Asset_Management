import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
// import './AddAssets.css'; // REMOVE THIS LINE - rely on global CSS

const EditAsset = () => {
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
        status: '',
        description: ''
    });
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [fetching, setFetching] = useState(true); // State for initial data fetching
    const [error, setError] = useState('');     // State for error messages
    const [success, setSuccess] = useState('');   // State for success messages

    const navigate = useNavigate();
    const { id } = useParams();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!id) {
            setError('Invalid asset ID. Redirecting...');
            setTimeout(() => navigate('/assets'), 2000);
            return;
        }
        if (!token) {
            setError('Not authorized. Please log in. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setFetching(true);
        const fetchAsset = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/assets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                setFormData({
                    name: data.name || '',
                    type: data.type || '',
                    category: data.category || '',
                    // Ensure date is formatted correctly for 'date' input type
                    purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
                    warranty: data.warranty || '',
                    location: data.location || '',
                    condition: data.condition || '',
                    serialNumber: data.serialNumber || '',
                    assignedTo: data.assignedTo || '',
                    status: data.status || '',
                    description: data.description || ''
                });
                setError(''); // Clear any previous errors on successful fetch
            } catch (err) {
                console.error('Error fetching asset:', err.response?.data || err.message);
                setError('Failed to load asset data. Redirecting...');
                setTimeout(() => navigate('/assets'), 2000); // Redirect on fetch error
            } finally {
                setFetching(false); // End fetching
            }
        };
        fetchAsset();
    }, [id, token, navigate]); // Added navigate to dependency array

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages
        setLoading(true); // Start loading

        // Basic client-side validation
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
            status: formData.status.trim(),
            description: formData.description.trim(),
        };

        try {
            await axios.put(`http://localhost:5000/assets/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Asset updated successfully!');
            setTimeout(() => navigate('/assets'), 1500); // Navigate after a short delay
        } catch (err) {
            console.error('Error updating asset:', err.response?.data || err.message);
            setError('Failed to update asset: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    if (fetching) {
        return <p className="loading-message">Loading asset data...</p>;
    }

    // Display critical errors that lead to redirection
    if (error && (error.includes('Invalid asset ID') || error.includes('Not authorized') || error.includes('Failed to load asset data'))) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="edit-movement-container"> {/* Consistent container class */}
            <div className="header-with-back-button">
                <button onClick={() => navigate('/assets')} className="back-button">
                    &larr; Back to Assets
                </button>
                <h2 className="edit-movement-title">Edit Asset Details</h2> {/* Consistent title class */}
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form className="edit-movement-form" onSubmit={handleSubmit}> {/* Consistent form grid class */}
                <div className="form-group">
                    <label htmlFor="name">Asset Name:</label>
                    <input
                        id="name"
                        className="form-control" // Consistent input class
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Laptop, Projector"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="type">Type:</label>
                    <input
                        id="type"
                        className="form-control"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        placeholder="e.g., Electronic, Furniture"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                        id="category"
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., IT Equipment, Office Supplies"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="purchaseDate">Purchase Date:</label>
                    <input
                        id="purchaseDate"
                        className="form-control"
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="warranty">Warranty (Years):</label>
                    <input
                        id="warranty"
                        className="form-control"
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleChange}
                        placeholder="e.g., 2 years"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location:</label>
                    <input
                        id="location"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Office A, Storeroom"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="condition">Condition:</label>
                    <input
                        id="condition"
                        className="form-control"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        placeholder="e.g., New, Good, Fair"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        id="serialNumber"
                        className="form-control"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="e.g., SN123456789"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="assignedTo">Assigned To:</label>
                    <input
                        id="assignedTo"
                        className="form-control"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        placeholder="e.g., John Doe, Dept. X"
                    />
                </div>

                {/* Description and Status fields will span all columns */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        className="form-control" // Consistent select class
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="in_repair">In Repair</option>
                        <option value="disposed">Disposed</option>
                    </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                        id="description"
                        className="form-control description-textarea" // Consistent textarea class
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Additional details about the asset..."
                        rows={3}
                    />
                </div>

                <div className="form-actions"> {/* Consistent actions container */}
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
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
                        {loading ? 'Updating...' : 'Update Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAsset;