import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Make sure to install this: npm install jwt-decode
import './AssetList.css';

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError('');
        if (!token) {
            setError('You must be logged in to view assets.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://172.16.0.36:5000/assets', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search: searchQuery,
                    type: filterType === 'all' ? '' : filterType,
                }
            });
            setAssets(response.data);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to fetch assets.');
        } finally {
            setLoading(false);
        }
    }, [token, searchQuery, filterType]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const deleteAsset = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;

        try {
            await axios.delete(`http://172.16.0.36:5000/assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAssets();
        } catch (err) {
            console.error('Error deleting asset:', err);
            alert('Failed to delete asset.');
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setCurrentPage(1);
    };

    const handleBackToDashboard = () => {
        if (!token) {
            navigate('/'); // no token, go to login
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const role = decoded.role; // adjust if your JWT uses a different key
            if (role === 'super_admin') {
                navigate('/super-admin');
            } else if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'user') {
                navigate('/user');
            } else {
                navigate('/'); // fallback
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/'); // fallback
        }
    };

    const indexOfLastAsset = currentPage * rowsPerPage;
    const indexOfFirstAsset = indexOfLastAsset - rowsPerPage;
    const currentAssets = assets.slice(indexOfFirstAsset, indexOfLastAsset);
    const totalPages = Math.ceil(assets.length / rowsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationButtons = () => {
        const pageButtons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => paginate(i)}
                >
                    {i}
                </button>
            );
        }
        return pageButtons;
    };

    return (
        <div className="movement-list-page">
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        <button
                            className="reset-btn"
                            onClick={handleBackToDashboard}
                            style={{ marginRight: '10px' }}
                        >
                            <i className="fas fa-arrow-left"></i> Back to Dashboard
                        </button>
                        <Link to="/assets/add" className="add-movement-btn">
                            <i className="fas fa-plus"></i> Add Asset
                        </Link>
                        <select
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Vehicle">Vehicle</option>
                        </select>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <button className="reset-btn" onClick={handleResetFilters}>
                            <i className="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                {loading ? (
                    <div className="loading-message">
                        <i className="fas fa-spinner fa-spin"></i> Loading assets...
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                ) : currentAssets.length === 0 ? (
                    <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No assets found.
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Serial Number</th>
                                <th>Purchase Date</th>
                                <th>Warranty</th>
                                <th>Location</th>
                                <th>Condition</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAssets.map((a, index) => (
                                <tr key={a._id}>
                                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td>{a.name}</td>
                                    <td>{a.type || 'N/A'}</td>
                                    <td>{a.category || 'N/A'}</td>
                                    <td>{a.serialNumber || 'N/A'}</td>
                                    <td>{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{a.warranty || 'N/A'}</td>
                                    <td>{a.location || 'N/A'}</td>
                                    <td>{a.condition || 'N/A'}</td>
                                    <td>{a.assignedTo || 'N/A'}</td>
                                    <td>{a.status || 'N/A'}</td>
                                    <td>{a.description || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <Link to={`/assets/edit/${a._id}`} className="action-btn edit-btn" title="Edit Asset">
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => deleteAsset(a._id)}
                                            title="Delete Asset"
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

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <div className="rows-per-page-selector">
                        Rows per page:
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <button
                        className="pagination-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    {renderPaginationButtons()}
                    <button
                        className="pagination-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssetList;
