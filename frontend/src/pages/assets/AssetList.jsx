import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom'; // No need for useLocation if we are not directly reacting to location changes for data fetch
import axios from 'axios';
import './AssetList.css'; // Make sure this path is correct

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // Example: filter by asset type or status
    const [rowsPerPage, setRowsPerPage] = useState(10); // For basic pagination control
    const token = localStorage.getItem('token');

    // Memoize fetchAssets using useCallback for performance and to satisfy useEffect dependencies
    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:5000/assets', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    type: filterType === 'all' ? '' : filterType, // Send filter param
                },
            });
            setAssets(res.data);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to fetch assets.');
        } finally {
            setLoading(false);
        }
    }, [token, searchQuery, filterType]); // Dependencies for useCallback

    // Fetch assets on component mount or when search/filter changes
    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]); // fetchAssets is a dependency here, which is memoized

    const deleteAsset = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            await axios.delete(`http://localhost:5000/assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Re-fetch assets to update the list after deletion
            fetchAssets();
        } catch (err) {
            console.error('Error deleting asset:', err);
            alert('Failed to delete asset.');
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        // Reset pagination if implemented
        // setPage(1);
    };

    // Simple pagination: slicing the array. For real apps, implement backend pagination.
    const paginatedAssets = assets.slice(0, rowsPerPage);

    return (
        <div className="movement-list-page"> {/* Re-using the main page container class */}
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        {/* Add Asset Button */}
                        <Link to="/assets/add" className="add-movement-btn">
                            <i className="fas fa-plus"></i> Add Asset
                        </Link>

                        {/* Filter by Type (Example: You might filter by 'status' or 'category' if your asset has those fields) */}
                        <select
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Vehicle">Vehicle</option>
                            {/* Add actual asset types from your data */}
                        </select>
                    </div>

                    <div className="header-right">
                        {/* Search Box */}
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search assets..."
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

            {/* Main content area: table and messages */}
            <div className="table-responsive">
                {loading ? (
                    <div className="loading-message">
                        <i className="fas fa-spinner fa-spin"></i> Loading assets...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                ) : paginatedAssets.length === 0 ? (
                    <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No assets found.
                    </div>
                ) : (
                    <table className="data-table"> {/* Applying the data-table class */}
                        <thead>
                            <tr>
                                <th>#</th> {/* Row number */}
                                <th>Name</th>
                                <th>Category</th> {/* Added for common asset data, adjust as per your schema */}
                                <th>Serial Number</th> {/* Added for common asset data */}
                                <th>Purchase Date</th> {/* Added for common asset data */}
                                <th>Location</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAssets.map((a, index) => (
                                <tr key={a._id}>
                                    <td>{index + 1}</td>
                                    <td>{a.name}</td>
                                    <td>{a.category || 'N/A'}</td> {/* Assuming a 'category' field */}
                                    <td>{a.serialNumber || 'N/A'}</td> {/* Assuming a 'serialNumber' field */}
                                    <td>{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A'}</td> {/* Assuming a 'purchaseDate' field */}
                                    <td>{a.location}</td>
                                    <td className="actions-cell">
                                        <Link to={`/assets/edit/${a._id}`} className="action-btn edit-btn" title="Edit">
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <Link to={`/assets/view/${a._id}`} className="action-btn view-btn" title="View Details">
                                            <i className="fas fa-eye"></i> {/* View icon */}
                                        </Link>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => deleteAsset(a._id)}
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
                <div className="rows-per-page-selector">
                    Rows per page:
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn" disabled>Next</button>
            </div>
        </div>
    );
};

export default AssetList;