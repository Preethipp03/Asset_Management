import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MaintenanceList.css'; // <-- Import the new CSS file here

const MaintenanceList = () => {
    const [maintenance, setMaintenance] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filter, setFilter] = useState({ status: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const res = await axios.get('http://localhost:5000/maintenance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMaintenance(res.data);
            } catch (error) {
                console.error('Error fetching maintenance data:', error);
            }
        };

        fetchMaintenance();
    }, [token]);

    useEffect(() => {
        let data = [...maintenance];

        if (filter.status) {
            data = data.filter(item => item.status === filter.status);
        }

        if (filter.type) {
            data = data.filter(item => item.maintenanceType === filter.type);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(item =>
                (item.assetName?.toLowerCase().includes(term)) ||
                (item.performedBy?.toLowerCase().includes(term))
            );
        }

        setFiltered(data);
    }, [filter, maintenance, searchTerm]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;

        try {
            await axios.delete(`http://localhost:5000/maintenance/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenance(prev => prev.filter(m => m._id !== id));
        } catch (error) {
            console.error('Error deleting maintenance record:', error);
            alert('Failed to delete maintenance record');
        }
    };

    return (
        <div className="maintenance-list-container"> {/* Main container */}
            <h2 className="maintenance-list-title">Maintenance Records</h2> {/* Title */}

            <div className="filters-search-section"> {/* Container for filters and search */}
                <div className="filter-group">
                    <label>Status: </label>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                        className="filter-select" // Added class
                    >
                        <option value="">All</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Type: </label>
                    <select
                        value={filter.type}
                        onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                        className="filter-select" // Added class
                    >
                        <option value="">All</option>
                        <option value="preventive">Preventive</option>
                        <option value="corrective">Corrective</option>
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Search by asset or technician"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input" // Added class
                />
            </div>

            <table className="maintenance-table"> {/* Table element */}
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Type</th>
                        <th>Technician</th>
                        <th>Scheduled Date</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <tr key={item._id}>
                                <td>{item.assetName || 'Unknown'}</td>
                                <td>{item.maintenanceType}</td>
                                <td>{item.performedBy || '-'}</td>
                                <td>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                                <td><span className={`status-badge status-${item.status.toLowerCase().replace(/\s/g, '-')}`}>{item.status}</span></td> {/* Added class for status badge */}
                                <td className="maintenance-description-cell">{item.description || '-'}</td>
                                <td className="table-actions"> {/* Actions column */}
                                    <Link to={`/maintenance/edit/${item._id}`}>
                                        <button type="button" className="action-button edit-button">Edit</button>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item._id)}
                                        className="action-button delete-button"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-records-message">
                                No maintenance records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MaintenanceList;