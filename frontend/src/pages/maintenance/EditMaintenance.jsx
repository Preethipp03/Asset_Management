import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditMaintenance.css'; // Import the dedicated CSS file

const EditMaintenance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [assets, setAssets] = useState([]);
    const [formData, setFormData] = useState({
        assetId: '',
        maintenanceType: '',
        scheduledDate: '',
        status: '',
        performedBy: '',
        description: ''
    });
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/assets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAssets(res.data);
            } catch (err) {
                console.error('Failed to fetch assets:', err);
                setError('Failed to load asset options.');
            }
        };

        const fetchMaintenance = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/maintenance/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                setFormData({
                    assetId: data.assetId || '',
                    maintenanceType: data.maintenanceType || '',
                    scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '', // Format date for input type="date"
                    status: data.status || '',
                    performedBy: data.performedBy || '',
                    description: data.description || ''
                });
                setLoading(false); // Set loading to false once data is fetched
            } catch (error) {
                console.error('Error loading maintenance:', error);
                setError('Failed to load maintenance record.');
                setLoading(false);
                // Optionally navigate away if record doesn't exist or unauthorized
                // navigate('/maintenance');
            }
        };

        if (token) {
            fetchAssets();
            fetchMaintenance();
        } else {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            // navigate('/login'); // Redirect to login if no token
        }
    }, [id, token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading state on submission

        try {
            await axios.put(`http://localhost:5000/maintenance/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Maintenance record updated successfully.');
            navigate('/maintenance'); // Navigate back to the maintenance list
        } catch (error) {
            console.error('Error updating maintenance:', error);
            alert('Failed to update maintenance record. Please check console for details.');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-text">Loading maintenance record...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>; // Display error message
    }

    return (
        <div className="edit-maintenance-container">
            <h2 className="edit-maintenance-title">Edit Maintenance Record</h2>
            <form onSubmit={handleSubmit} className="edit-maintenance-form">

                <div className="form-group">
                    <label htmlFor="assetId">Asset:</label>
                    <select
                        id="assetId"
                        name="assetId"
                        value={formData.assetId}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
                        <option value="">-- Select Asset --</option>
                        {assets.map((a) => (
                            <option key={a._id} value={a._id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="maintenanceType">Maintenance Type:</label>
                    <select
                        id="maintenanceType"
                        name="maintenanceType"
                        value={formData.maintenanceType}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
                        <option value="">Select Type</option>
                        <option value="preventive">Preventive</option>
                        <option value="corrective">Corrective</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="scheduledDate">Scheduled Date:</label>
                    <input
                        id="scheduledDate"
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
                        <option value="">Select Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="performedBy">Performed By (Technician):</label>
                    <input
                        id="performedBy"
                        type="text"
                        name="performedBy"
                        value={formData.performedBy}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control description-textarea"
                    ></textarea>
                </div>

                <div className="form-actions"> {/* Container for buttons */}
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Maintenance'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/maintenance')}
                        className="cancel-button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMaintenance;