import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddMaintenance.css';

const AddMaintenance = () => {
    const [form, setForm] = useState({
        assetName: '',
        serialNumber: '',
        maintenanceType: 'preventive',
        scheduledDate: '',
        status: 'scheduled',
        performedBy: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:5000/maintenance', form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Maintenance record added successfully!');
            navigate('/maintenance');
        } catch (err) {
            console.error('Failed to add maintenance:', err.response?.data || err.message);
            alert('Error adding maintenance: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-maintenance-container">
            <h2 className="add-maintenance-title">Schedule New Maintenance</h2>

            <form onSubmit={handleSubmit} className="add-maintenance-form">
                <div className="form-group">
                    <label>Asset Name:</label>
                    <input
                        type="text"
                        name="assetName"
                        value={form.assetName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter Asset Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Serial Number:</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={form.serialNumber}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter Serial Number"
                        required
                    />
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
                    />
                </div>

                <div className="form-actions">
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
