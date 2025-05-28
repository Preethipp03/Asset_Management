import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddMaintenance.css'; // Import the new CSS file

const AddMaintenance = () => {
    const [assets, setAssets] = useState([]);
    const [form, setForm] = useState({
        assetId: '',
        maintenanceType: 'preventive',
        scheduledDate: '',
        status: 'scheduled',
        performedBy: '',
        description: '',
    });
    const [loading, setLoading] = useState(false); // Add loading state for submission
    const [fetchError, setFetchError] = useState(null); // Error for fetching assets

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/assets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAssets(res.data);
            } catch (err) {
                console.error('Failed to fetch assets:', err);
                setFetchError('Failed to load asset options. Please try again.');
            }
        };
        if (token) {
            fetchAssets();
        } else {
            setFetchError('Authentication token not found. Please log in.');
            // Optionally navigate('/login');
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading true on submission

        try {
            console.log('Submitting maintenance:', form); // Debug log
            await axios.post('http://localhost:5000/maintenance', form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Maintenance record added successfully!');
            navigate('/maintenance'); // Redirect to maintenance list
        } catch (err) {
            console.error('Failed to add maintenance:', err.response?.data || err.message);
            alert('Error adding maintenance: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false); // Set loading false after submission attempt
        }
    };

    if (fetchError) {
        return <div className="error-message">Error: {fetchError}</div>;
    }

    return (
        <div className="add-maintenance-container"> {/* Main container */}
            <h2 className="add-maintenance-title">Schedule New Maintenance</h2> {/* Title */}

            <form onSubmit={handleSubmit} className="add-maintenance-form"> {/* Form element */}

                <div className="form-group"> {/* Wrapper for each field */}
                    <label htmlFor="assetId">Select Asset:</label>
                    <select
                        id="assetId"
                        name="assetId"
                        value={form.assetId}
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
                        value={form.maintenanceType}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
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
                        value={form.scheduledDate}
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
                        value={form.status}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="performedBy">Technician:</label>
                    <input
                        id="performedBy"
                        type="text"
                        name="performedBy"
                        value={form.performedBy}
                        onChange={handleChange}
                        required
                        placeholder="Technician Name"
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description (optional)"
                        className="form-control description-textarea"
                    ></textarea>
                </div>

                <div className="form-actions"> {/* Container for buttons */}
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Maintenance'}
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

export default AddMaintenance;