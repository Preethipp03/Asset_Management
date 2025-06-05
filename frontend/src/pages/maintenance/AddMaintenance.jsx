import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome is imported

// IMPORTANT: Import your CSS file here. Adjust the path as needed.
import './AddMaintenance.css';

const AddMaintenance = () => {
    const [maintenanceData, setMaintenanceData] = useState({
        assetName: '',
        serialNumber: '',
        maintenanceType: 'preventive',
        scheduledDate: '',
        nextScheduledDate: '',
        status: 'scheduled',
        technicianInHouse: '',
        technicianVendor: '',
        description: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setMaintenanceData({
            ...maintenanceData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setSuccess('');

        // Validation
        if (!maintenanceData.assetName.trim()) {
            setError('Asset Name is required');
            return;
        }
        if (!maintenanceData.serialNumber.trim()) {
            setError('Serial Number is required');
            return;
        }
        if (!maintenanceData.scheduledDate) {
            setError('Scheduled Date is required');
            return;
        }
        if (
            maintenanceData.nextScheduledDate &&
            maintenanceData.nextScheduledDate <= maintenanceData.scheduledDate
        ) {
            setError('Next Scheduled Date must be after Scheduled Date');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in.');
                setLoading(false);
                return;
            }

            await axios.post('http://172.16.0.36:5000/maintenance', maintenanceData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess('Maintenance record added successfully!');
            // Reset form fields
            setMaintenanceData({
                assetName: '',
                serialNumber: '',
                maintenanceType: 'preventive',
                scheduledDate: '',
                nextScheduledDate: '',
                status: 'scheduled',
                technicianInHouse: '',
                technicianVendor: '',
                description: '',
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add maintenance record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-movement-container">
            {/* START: NEW CONTAINER FOR TITLE AND BACK BUTTON */}
            <div className="header-with-back-button">
                <button
                    className="back-button" // Specific class for the back button
                    onClick={() => navigate(-1)}
                >
                    <i className="fas fa-arrow-left"></i> Back
                </button>
                <h2 className="edit-movement-title">Add Maintenance Record</h2>
            </div>
            {/* END: NEW CONTAINER */}

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {loading && (
                <p className="loading-message">
                    <i className="fas fa-spinner fa-spin"></i> Adding maintenance record...
                </p>
            )}

            <form onSubmit={handleSubmit} className="edit-movement-form">
                {/* Asset Name */}
                <div className="form-group">
                    <label htmlFor="assetName">Asset Name:</label>
                    <input
                        type="text"
                        id="assetName"
                        name="assetName"
                        value={maintenanceData.assetName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., HVAC Unit"
                    />
                </div>

                {/* Serial Number */}
                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        type="text"
                        id="serialNumber"
                        name="serialNumber"
                        value={maintenanceData.serialNumber}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., SN12345"
                    />
                </div>

                {/* Maintenance Type */}
                <div className="form-group">
                    <label htmlFor="maintenanceType">Maintenance Type:</label>
                    <select
                        id="maintenanceType"
                        name="maintenanceType"
                        value={maintenanceData.maintenanceType}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="preventive">Preventive</option>
                        <option value="corrective">Corrective</option>
                        <option value="predictive">Predictive</option>
                    </select>
                </div>

                {/* Scheduled Date */}
                <div className="form-group">
                    <label htmlFor="scheduledDate">Scheduled Date:</label>
                    <input
                        type="date"
                        id="scheduledDate"
                        name="scheduledDate"
                        value={maintenanceData.scheduledDate}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                {/* Next Scheduled Date */}
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

                {/* Status */}
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={maintenanceData.status}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Technician In-House */}
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

                {/* Technician Vendor */}
                <div className="form-group">
                    <label htmlFor="technicianVendor">Technician (Vendor):</label>
                    <input
                        type="text"
                        id="technicianVendor"
                        name="technicianVendor"
                        value={maintenanceData.technicianVendor}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., ABC Services"
                    />
                </div>

                {/* Description - Spans full width */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={maintenanceData.description}
                        onChange={handleChange}
                        className="form-control description-textarea"
                        placeholder="Detailed description of maintenance performed or planned."
                    />
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Record'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMaintenance;