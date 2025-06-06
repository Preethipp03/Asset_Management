import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../api/axios';
import './movements.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SortIcon = () => <span>⇅</span>;

const MovementList = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [returnableFilter, setReturnableFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchMovements = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await api.get('/movements', config);
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
        let result = [...movements];

        if (search.trim()) {
            const lowerCaseSearch = search.toLowerCase();
            result = result.filter((m) =>
                m.assetName?.toLowerCase().includes(lowerCaseSearch) ||
                m.serialNumber?.toLowerCase().includes(lowerCaseSearch) ||
                m.movementFrom?.toLowerCase().includes(lowerCaseSearch) ||
                m.movementTo?.toLowerCase().includes(lowerCaseSearch) ||
                m.dispatchedBy?.toLowerCase().includes(lowerCaseSearch) ||
                m.receivedBy?.toLowerCase().includes(lowerCaseSearch)
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

    const totalPages = Math.ceil(filteredMovements.length / rowsPerPage);
    const indexOfLastMovement = currentPage * rowsPerPage;
    const indexOfFirstMovement = indexOfLastMovement - rowsPerPage;
    const currentMovements = filteredMovements.slice(indexOfFirstMovement, indexOfLastMovement);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleResetFilters = () => {
        setSearch('');
        setTypeFilter('');
        setReturnableFilter('');
        setCurrentPage(1);
    };

    const deleteMovement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movement?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await api.delete(`/movements/${id}`, config);
            setMovements((prev) => prev.filter((m) => m._id !== id));
        } catch (err) {
            alert('Failed to delete movement. ' + (err.response?.data?.error || ''));
        }
    };

    return (
        <div className="movement-list-page">
            <div className="fixed-header-section">
                <div className="table-controls-header">
                    <div className="header-left">
                        <button className="reset-btn" onClick={handleBackToDashboard} style={{ marginRight: '10px' }}>
                            <i className="fa-solid fa-arrow-left"></i> Back
                        </button>

                        <Link to="/movements/add" className="add-movement-btn">
                            <i className="fa-solid fa-plus"></i> Add Movement
                        </Link>

                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            className="filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="inside_building">Inside</option>
                            <option value="outside_building">Outside</option>
                        </select>

                        {/* Updated structure for Returnable filter and Reset button */}
                        <div className="returnable-filter-group">
                            <select
                                value={returnableFilter}
                                onChange={(e) => { setReturnableFilter(e.target.value); setCurrentPage(1); }}
                                className="filter-select"
                            >
                                <option value="">All Returnable</option>
                                <option value="true">Returnable</option>
                                <option value="false">Non-returnable</option>
                            </select>

                            <button className="reset-btn" onClick={handleResetFilters}>
                                <i className="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by asset, serial, or personnel"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        </div>
                        <div className="rows-per-page-selector">
                            Showing {Math.min(indexOfFirstMovement + 1, filteredMovements.length)} to {Math.min(indexOfLastMovement, filteredMovements.length)} of {filteredMovements.length} rows
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
                            rows per page
                        </div>
                    </div>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p className="loading-message">Loading movements...</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
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
                                                <i className="fa-solid fa-pencil"></i>
                                            </Link>
                                            <button className="action-btn delete-btn" onClick={() => deleteMovement(m._id)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
    );
};

export default MovementList;