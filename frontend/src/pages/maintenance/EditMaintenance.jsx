import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditMaintenance = () => {
    const { id } = useParams(); // Gets the ID from the URL parameter
    const navigate = useNavigate(); // Hook for navigation

    const [maintenanceData, setMaintenanceData] = useState({
        assetName: '',
        serialNumber: '',
        maintenanceType: 'preventive', // Default value
        scheduledDate: '',
        nextScheduledDate: '',
        status: 'scheduled', // Default value
        technicianInHouse: '',
        technicianVendor: '',
        description: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true); // State to manage loading status

    // Options for dropdowns - kept consistent
    const maintenanceTypeOptions = ['preventive', 'corrective', 'predictive'];
    const statusOptions = ['scheduled', 'in-progress', 'completed', 'cancelled'];

    useEffect(() => {
        const fetchMaintenance = async () => {
            setLoading(true); // Start loading
            setError(''); // Clear previous errors
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please log in.');
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`http://localhost:5000/maintenance/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Helper to format date strings for input type="date" (YYYY-MM-DD)
                const toDateInput = (dateStr) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    // Ensure the date is correctly formatted for the input
                    return d.toISOString().split('T')[0];
                };

                setMaintenanceData({
                    assetName: res.data.assetName || '',
                    serialNumber: res.data.serialNumber || '',
                    maintenanceType: res.data.maintenanceType || 'preventive',
                    scheduledDate: toDateInput(res.data.scheduledDate),
                    nextScheduledDate: toDateInput(res.data.nextScheduledDate),
                    status: res.data.status || 'scheduled',
                    technicianInHouse: res.data.technicianInHouse || '',
                    technicianVendor: res.data.technicianVendor || '',
                    description: res.data.description || '',
                });
            } catch (err) {
                console.error('Failed to fetch maintenance record:', err);
                setError('Failed to load maintenance record. Please try again.');
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchMaintenance();
    }, [id]); // Dependency array: re-run effect if ID changes

    const handleChange = (e) => {
        setMaintenanceData({
            ...maintenanceData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError('');      // Clear previous errors
        setSuccess('');    // Clear previous success messages

        // Client-side validation:
        if (!maintenanceData.assetName.trim()) {
            setError('Asset Name is required.');
            return;
        }
        if (!maintenanceData.serialNumber.trim()) {
            setError('Serial Number is required.');
            return;
        }
        if (!maintenanceData.scheduledDate) {
            setError('Scheduled Date is required.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to perform this action.');
                return;
            }

            // Send PUT request to update the record
            await axios.put(`http://localhost:5000/maintenance/${id}`, maintenanceData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess('Maintenance record updated successfully!');
            // Redirect to the maintenance list page after a short delay
            setTimeout(() => {
                navigate('/maintenance');
            }, 1500);
        } catch (err) {
            console.error('Update error:', err.response?.data || err);
            setError(err.response?.data?.error || 'Failed to update maintenance record. Please try again.');
        }
    };

    // Conditional rendering for loading state
    if (loading) {
        return (
            <div className="edit-movement-container">
                <p className="loading-message">Loading maintenance record...</p>
            </div>
        );
    }

    return (
        <div className="edit-movement-container"> {/* Main container for the form */}
            <div className="header-with-back-button"> {/* Header with back button and title */}
                <button onClick={() => navigate('/maintenance')} className="back-button">
                    &larr; Back to List
                </button>
                <h2 className="edit-movement-title">Edit Maintenance Record</h2> {/* Page title */}
            </div>

            {/* Display error or success messages */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleSubmit} className="edit-movement-form"> {/* Form layout using CSS Grid */}
                {/* Asset Name Field */}
                <div className="form-group">
                    <label htmlFor="assetName">Asset Name:</label>
                    <input
                        type="text"
                        id="assetName"
                        name="assetName"
                        value={maintenanceData.assetName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., HVAC Unit 1"
                        required // HTML5 validation
                    />
                </div>

                {/* Serial Number Field */}
                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        type="text"
                        id="serialNumber"
                        name="serialNumber"
                        value={maintenanceData.serialNumber}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., SN-123456789"
                        required
                    />
                </div>

                {/* Maintenance Type Dropdown */}
                <div className="form-group">
                    <label htmlFor="maintenanceType">Maintenance Type:</label>
                    <select
                        id="maintenanceType"
                        name="maintenanceType"
                        value={maintenanceData.maintenanceType}
                        onChange={handleChange}
                        className="form-control"
                    >
                        {maintenanceTypeOptions.map((type) => (
                            <option key={type} value={type}>
                                {/* Capitalize first letter and display */}
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Scheduled Date Field */}
                <div className="form-group">
                    <label htmlFor="scheduledDate">Scheduled Date:</label>
                    <input
                        type="date"
                        id="scheduledDate"
                        name="scheduledDate"
                        value={maintenanceData.scheduledDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* Next Scheduled Date Field */}
                <div className="form-group">
                    <label htmlFor="nextScheduledDate">Next Scheduled Date:</label>
                    <input
                        type="date"
                        id="nextScheduledDate"
                        name="nextScheduledDate"
                        value={maintenanceData.nextScheduledDate}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={maintenanceData.status}
                        onChange={handleChange}
                        className="form-control"
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {/* Capitalize first letter and replace hyphens with spaces */}
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Technician In-House Field */}
                <div className="form-group">
                    <label htmlFor="technicianInHouse">Technician (In-House):</label>
                    <input
                        type="text"
                        id="technicianInHouse"
                        name="technicianInHouse"
                        value={maintenanceData.technicianInHouse}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., John Doe"
                    />
                </div>

                {/* Technician Vendor Field */}
                <div className="form-group">
                    <label htmlFor="technicianVendor">Technician (Vendor):</label>
                    <input
                        type="text"
                        id="technicianVendor"
                        name="technicianVendor"
                        value={maintenanceData.technicianVendor}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Acme Services"
                    />
                </div>

                {/* Description Textarea (spans all columns) */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}> {/* This style makes it span all columns */}
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={maintenanceData.description}
                        onChange={handleChange}
                        className="form-control description-textarea"
                        placeholder="Provide details about the maintenance, observations, performed tasks, etc."
                    ></textarea>
                </div>

                {/* Form Action Buttons */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/maintenance')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Update Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMaintenance;