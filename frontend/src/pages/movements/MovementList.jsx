import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './AddMovement.css'; // Assuming you renamed AddMovement.css to MovementList.css
import '@fortawesome/fontawesome-free/css/all.min.css'; // For icons

// Icons (using Font Awesome classes directly where used in JSX)
const SortIcon = () => <span>⇅</span>; // Placeholder for sort icon

const MovementList = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [returnableFilter, setReturnableFilter] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await api.get('/movements');
                setMovements(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch movements.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovements();
    }, []);

    const filteredMovements = useMemo(() => {
        let result = movements;

        if (search.trim()) {
            result = result.filter((m) =>
                m.assetName.toLowerCase().includes(search.toLowerCase()) ||
                m.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
                m.movementFrom?.toLowerCase().includes(search.toLowerCase()) ||
                m.movementTo?.toLowerCase().includes(search.toLowerCase()) ||
                m.dispatchedBy?.toLowerCase().includes(search.toLowerCase()) ||
                m.receivedBy?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (typeFilter) {
            result = result.filter((m) => m.movementType === typeFilter);
        }

        if (returnableFilter !== '') {
            const isReturnable = returnableFilter === 'true';
            result = result.filter((m) => m.returnable === isReturnable);
        }

        return result;
    }, [search, typeFilter, returnableFilter, movements]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredMovements.length / rowsPerPage);
    const indexOfLastMovement = currentPage * rowsPerPage;
    const indexOfFirstMovement = indexOfLastMovement - rowsPerPage;
    const currentMovements = filteredMovements.slice(indexOfFirstMovement, indexOfLastMovement);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const deleteMovement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movement?')) return;
        try {
            await api.delete(`/movements/${id}`);
            setMovements((prev) => prev.filter((m) => m._id !== id));
        } catch (err) {
            alert('Failed to delete movement. ' + (err.response?.data?.error || ''));
        }
    };

    return (
        <div className="movement-list-container">
            <div className="card">
                <div className="card-header">
                    <div className="header-left">
                        <Link to="/movements/add" className="add-movement-btn">
                            <i className="fa-solid fa-plus"></i> Add Movement
                        </Link>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        </div>
                        <div className="rows-per-page-selector">
                            Showing {Math.min(indexOfFirstMovement + 1, filteredMovements.length)} to {Math.min(indexOfLastMovement, filteredMovements.length)} of {filteredMovements.length} rows
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when rows per page changes
                                }}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            rows per page
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="filter-controls">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="filter-select">
                        <option value="">All Types</option>
                        <option value="inside_building">Inside</option>
                        <option value="outside_building">Outside</option>
                    </select>

                    <select value={returnableFilter} onChange={(e) => setReturnableFilter(e.target.value)} className="filter-select">
                        <option value="">All Returnable</option>
                        <option value="true">Returnable</option>
                        <option value="false">Non-returnable</option>
                    </select>
                </div>

                {error && <p className="error-message">{error}</p>}
                {loading ? (
                    <p className="loading-message">Loading movements...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {/* Original Headers (no 'Image' column added) */}
                                    <th># <SortIcon /></th>
                                    <th>Asset <SortIcon /></th>
                                    <th>Serial No. <SortIcon /></th>
                                    <th>From <SortIcon /></th>
                                    <th>To <SortIcon /></th>
                                    <th>Type <SortIcon /></th>
                                    <th>Dispatched By <SortIcon /></th>
                                    <th>Received By <SortIcon /></th>
                                    <th>Date <SortIcon /></th>
                                    <th>Returnable <SortIcon /></th>
                                    <th>Expected Return <SortIcon /></th>
                                    <th>Returned At <SortIcon /></th>
                                    <th>Condition <SortIcon /></th>
                                    <th>Description <SortIcon /></th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan="15" className="no-data-message">No movements found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    currentMovements.map((m, index) => (
                                        <tr key={m._id}>
                                            {/* Original Data Cells (no 'Image' cell added) */}
                                            <td>{indexOfFirstMovement + index + 1}</td>
                                            <td>{m.assetName}</td>
                                            <td>{m.serialNumber || '-'}</td>
                                            <td>{m.movementFrom}</td>
                                            <td>{m.movementTo}</td>
                                            <td>{m.movementType === 'inside_building' ? 'Inside' : 'Outside'}</td>
                                            <td>{m.dispatchedBy}</td>
                                            <td>{m.receivedBy}</td>
                                            <td>{new Date(m.date).toLocaleString()}</td>
                                            <td>{m.returnable ? 'Yes' : 'No'}</td>
                                            <td>{m.returnable && m.expectedReturnDate ? new Date(m.expectedReturnDate).toLocaleDateString() : '-'}</td>
                                            <td>{m.returnedDateTime ? new Date(m.returnedDateTime).toLocaleString() : '-'}</td>
                                            <td>{m.assetCondition || '-'}</td>
                                            <td>{m.description || '-'}</td>
                                            <td className="actions-cell">
                                                <Link to={`/movements/edit/${m._id}`} className="action-btn edit-btn">
                                                    <i className="fa-solid fa-pencil"></i> {/* Direct Font Awesome usage */}
                                                </Link>
                                                <button className="action-btn delete-btn" onClick={() => deleteMovement(m._id)}>
                                                    <i className="fa-solid fa-trash"></i> {/* Direct Font Awesome usage */}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="pagination-controls">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovementList;