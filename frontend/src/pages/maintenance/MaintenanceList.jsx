import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './maintenance.css'; // Reusing the same CSS file for consistent styling
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome is imported

const SortIcon = () => <span>⇅</span>; // Re-use the sort icon placeholder

const MaintenanceList = () => {
    const [maintenance, setMaintenance] = useState([]);
    const [filter, setFilter] = useState({ status: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page, though not used for actual pagination yet

    useEffect(() => {
        const fetchMaintenance = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get('http://localhost:5000/maintenance', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMaintenance(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch maintenance records.');
            } finally {
                setLoading(false);
            }
        };
        fetchMaintenance();
    }, [token]);

    const filteredMaintenance = useMemo(() => {
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
                (item.performedBy?.toLowerCase().includes(term)) ||
                (item.description?.toLowerCase().includes(term))
            );
        }
        return data;
    }, [filter, maintenance, searchTerm]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
        try {
            await axios.delete(`http://localhost:5000/maintenance/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMaintenance(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete maintenance record. ' + (err.response?.data?.error || ''));
        }
    };

    const calculateNextDate = (scheduledDate, frequency) => {
        if (!scheduledDate || !frequency) return '-';
        const date = new Date(scheduledDate);
        if (frequency === 'weekly') date.setDate(date.getDate() + 7);
        else if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
        else if (frequency === 'quarterly') date.setMonth(date.getMonth() + 3);
        else if (frequency === 'annually') date.setFullYear(date.getFullYear() + 1);
        return date.toLocaleDateString();
    };

    const currentMaintenanceRecords = filteredMaintenance;

    return (
        <div className="movement-list-page"> {/* Main page container */}
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        <Link to="/maintenance/add" className="add-movement-btn">
                            <i className="fa-solid fa-plus"></i> Add Maintenance
                        </Link>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="preventive">Preventive</option>
                            <option value="corrective">Corrective</option>
                        </select>

                        <button
                            onClick={() => {
                                setFilter({ status: '', type: '' });
                                setSearchTerm('');
                            }}
                            className="action-btn delete-btn" // Reusing delete-btn styling for reset
                        >
                            <i className="fa-solid fa-rotate-right"></i> Reset
                        </button>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by asset or technician"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        </div>
                        <div className="rows-per-page-selector">
                            Showing {filteredMaintenance.length} records
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                disabled
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            rows per page
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p className="loading-message">Loading maintenance records...</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Asset <SortIcon /></th>
                                <th>Type <SortIcon /></th>
                                <th>Technician <SortIcon /></th>
                                <th>Scheduled Date <SortIcon /></th>
                                <th>Next Maintenance <SortIcon /></th>
                                <th>Status <SortIcon /></th>
                                <th>Description <SortIcon /></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMaintenanceRecords.length > 0 ? (
                                currentMaintenanceRecords.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.assetName || 'Unknown'}</td>
                                        <td>{item.maintenanceType}</td>
                                        <td>{item.performedBy || '-'}</td>
                                        <td>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                                        <td>{calculateNextDate(item.scheduledDate, item.frequency)}</td>
                                        <td>{item.status}</td>
                                        <td>{item.description || '-'}</td>
                                        <td className="actions-cell">
                                            <Link to={`/maintenance/edit/${item._id}`} className="action-btn edit-btn">
                                                <i className="fa-solid fa-pencil"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="action-btn delete-btn"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data-message">
                                        {maintenance.length > 0
                                            ? 'No records match the current filters.'
                                            : 'No maintenance records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pagination-controls">
                <span style={{ color: 'var(--text-color-medium)', fontSize: '14px' }}>
                    Displaying {currentMaintenanceRecords.length} of {filteredMaintenance.length} records.
                </span>
            </div>
        </div>
    );
};

export default MaintenanceList;