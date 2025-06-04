import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './MaintenanceList.css'; // Ensure this CSS file is in the same directory

const MaintenanceList = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [rowsPerPage, setRowsPerPage] = useState(10); // State for rows per page
    const navigate = useNavigate();

    // Memoize fetchMaintenances using useCallback.
    // This ensures the function reference only changes if searchQuery or filterType change,
    // preventing infinite loops in useEffect.
    const fetchMaintenances = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/maintenance', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: searchQuery,
                    type: filterType === 'all' ? '' : filterType,
                }
            });
            setMaintenances(response.data);
        } catch (err) {
            setError('Failed to load maintenance records');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterType]); // Dependencies for useCallback

    // useEffect now safely depends on the memoized fetchMaintenances function
    useEffect(() => {
        fetchMaintenances();
    }, [fetchMaintenances]);

    const handleEdit = (id) => {
        navigate(`/edit-maintenance/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this maintenance record?'
        );
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/maintenance/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMaintenances(); // Refresh list after delete
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete maintenance record');
        }
    };

    const handleAddMaintenance = () => {
        navigate('/maintenance/add'); // Assuming you have an add-maintenance route configured
    };
    
    const handleBackToDashboard = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const decoded = jwtDecode(token);
                const role = decoded.role;
                if (role === 'super_admin') navigate('/super-admin');
                else if (role === 'admin') navigate('/admin');
                else if (role === 'user') navigate('/user');
                else navigate('/');
            } catch (error) {
                console.error('Invalid token:', error);
                navigate('/');
            }
        };
    

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        // If you had pagination logic, you'd reset page number here too
        // setPage(1);
    };

    // Simple pagination: slicing the array for demonstration.
    // For large datasets, you'd implement backend pagination.
    const paginatedMaintenances = maintenances.slice(0, rowsPerPage);

    return (
        <div className="movement-list-page"> {/* Main page container for full-bleed style */}
            <div className="fixed-header-section"> {/* Header section with controls */}
                <div className="table-controls-header">
                    <div className="header-left">
                        {/* Moved Back Button here */}
                        <button className="reset-btn" onClick={handleBackToDashboard} style={{ marginRight: '10px' }}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>

                        {/* Add Maintenance Button */}
                        <button className="add-movement-btn" onClick={handleAddMaintenance}>
                            <i className="fas fa-plus"></i> Add Maintenance
                        </button>

                        {/* Filter Select */}
                        <select
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Preventive">Preventive</option>
                            <option value="Corrective">Corrective</option>
                            <option value="Predictive">Predictive</option>
                            {/* Add more maintenance types as needed */}
                        </select>
                    </div>

                    <div className="header-right">
                        {/* Search Box */}
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Reset Filters Button */}
                        <button className="reset-btn" onClick={handleResetFilters}>
                            <i className="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content area: responsive table wrapper */}
            <div className="table-responsive">
                {loading ? (
                    <div className="loading-message">
                        <i className="fas fa-spinner fa-spin"></i> Loading maintenance records...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                ) : maintenances.length === 0 ? (
                    <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No maintenance records found.
                    </div>
                ) : (
                    <table className="data-table"> {/* Table with styles */}
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Asset Name</th>
                                <th>Serial Number</th>
                                <th>Type</th>
                                <th>Scheduled Date</th>
                                <th>Status</th>
                                <th>Technician (In-House)</th>
                                <th>Technician (Vendor)</th>
                                <th>Description</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMaintenances.map((maintenance, index) => (
                                <tr key={maintenance._id}>
                                    <td>{index + 1}</td> {/* Row number */}
                                    <td>{maintenance.assetName}</td>
                                    <td>{maintenance.serialNumber}</td>
                                    <td>{maintenance.maintenanceType}</td>
                                    <td>{new Date(maintenance.scheduledDate).toLocaleDateString()}</td>
                                    <td>{maintenance.status}</td>
                                    <td>{maintenance.technicianInHouse}</td>
                                    <td>{maintenance.technicianVendor}</td>
                                    <td>{maintenance.description}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => handleEdit(maintenance._id)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(maintenance._id)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
                {/* Rows per page selector */}
                <div className="rows-per-page-selector">
                    Rows per page:
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                {/* Pagination buttons (logic for these is not implemented here, placeholders only) */}
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn active">1</button> {/* Example active page */}
                <button className="pagination-btn" disabled>Next</button>
            </div>
        </div>
    );
};

export default MaintenanceList;