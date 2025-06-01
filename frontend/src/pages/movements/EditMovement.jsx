import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditMovement.css'; 

const EditMovement = () => {
    const { id: movementId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Added success state

    const [formData, setFormData] = useState({
        assetName: '',
        assetId: '',
        serialNumber: '',
        movementFrom: '',
        movementTo: '',
        movementType: '',
        dispatchedBy: '',
        receivedBy: '',
        date: '',
        returnable: false,
        expectedReturnDate: '',
        returnedDateTime: '',
        assetCondition: '',
        description: '',
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!movementId) {
            setError('Invalid movement ID. Redirecting...');
            setTimeout(() => navigate('/movements'), 2000);
            return;
        }

        if (!token) {
            setError('Not authorized. Please log in. Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setFetching(true);
        axios
            .get(`http://localhost:5000/movements/${movementId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const data = res.data;
                setFormData({
                    assetName: data.assetName || '',
                    assetId: data.assetId || '',
                    serialNumber: data.serialNumber || '',
                    movementFrom: data.movementFrom || '',
                    movementTo: data.movementTo || '',
                    movementType: data.movementType || '',
                    dispatchedBy: data.dispatchedBy || '',
                    receivedBy: data.receivedBy || '',
                    // Format date-time for input type="datetime-local"
                    date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
                    returnable: data.returnable || false,
                    // Format date for input type="date"
                    expectedReturnDate: data.expectedReturnDate
                        ? new Date(data.expectedReturnDate).toISOString().slice(0, 10)
                        : '',
                    // Format date-time for input type="datetime-local"
                    returnedDateTime: data.returnedDateTime
                        ? new Date(data.returnedDateTime).toISOString().slice(0, 16)
                        : '',
                    assetCondition: data.assetCondition || '',
                    description: data.description || '',
                });
                setError('');
            })
            .catch((err) => {
                console.error('Failed to fetch movement data', err);
                setError('Failed to load movement data. Redirecting...');
                setTimeout(() => navigate('/movements'), 2000); // Redirect on fetch error
            })
            .finally(() => setFetching(false));
    }, [movementId, token, navigate]); // Added navigate to dependency array

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSuccess(''); // Clear previous success messages

        // Basic client-side validation
        if (
            !formData.assetName.trim() ||
            !formData.serialNumber.trim() ||
            !formData.movementFrom.trim() ||
            !formData.movementTo.trim() ||
            !formData.movementType.trim() ||
            !formData.dispatchedBy.trim() ||
            !formData.receivedBy.trim() ||
            !formData.date
        ) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.returnable && !formData.expectedReturnDate) {
            setError('Expected return date is required when returnable is checked.');
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `http://localhost:5000/movements/${movementId}`,
                {
                    assetName: formData.assetName.trim(),
                    assetId: formData.assetId,
                    serialNumber: formData.serialNumber.trim(),
                    movementFrom: formData.movementFrom.trim(),
                    movementTo: formData.movementTo.trim(),
                    movementType: formData.movementType.trim(),
                    dispatchedBy: formData.dispatchedBy.trim(),
                    receivedBy: formData.receivedBy.trim(),
                    date: new Date(formData.date).toISOString(), // Ensure date is ISO format
                    returnable: formData.returnable,
                    // Conditionally include expectedReturnDate and returnedDateTime
                    expectedReturnDate: formData.returnable && formData.expectedReturnDate
                        ? new Date(formData.expectedReturnDate).toISOString()
                        : null,
                    returnedDateTime: formData.returnedDateTime
                        ? new Date(formData.returnedDateTime).toISOString()
                        : null,
                    assetCondition: formData.assetCondition.trim(),
                    description: formData.description.trim(),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Movement updated successfully!');
            setTimeout(() => navigate('/movements'), 1500); // Navigate after a short delay
        } catch (err) {
            console.error('Failed to update movement', err.response?.data || err.message);
            setError('Failed to update movement: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <p className="loading-message">Loading movement data...</p>;
    }

    // Display critical errors that lead to redirection
    if (error && (error.includes('Invalid movement ID') || error.includes('Not authorized') || error.includes('Failed to load movement data'))) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="edit-movement-container">
            <div className="header-with-back-button">
                <button onClick={() => navigate('/movements')} className="back-button">
                    &larr; Back to Movements
                </button>
                <h2 className="edit-movement-title">Edit Movement Record</h2>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form className="edit-movement-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="assetName">Asset Name:</label>
                    <input
                        id="assetName"
                        type="text"
                        name="assetName"
                        value={formData.assetName}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        id="serialNumber"
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementFrom">Movement From:</label>
                    <input
                        id="movementFrom"
                        type="text"
                        name="movementFrom"
                        value={formData.movementFrom}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementTo">Movement To:</label>
                    <input
                        id="movementTo"
                        type="text"
                        name="movementTo"
                        value={formData.movementTo}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementType">Movement Type:</label>
                    <select
                        id="movementType"
                        name="movementType"
                        value={formData.movementType}
                        onChange={handleChange}
                        required
                        className="form-control"
                    >
                        <option value="">Select Type</option>
                        <option value="inside_building">Inside Building</option>
                        <option value="outside_building">Outside Building</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="dispatchedBy">Dispatched By:</label>
                    <input
                        id="dispatchedBy"
                        type="text"
                        name="dispatchedBy"
                        value={formData.dispatchedBy}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="receivedBy">Received By:</label>
                    <input
                        id="receivedBy"
                        type="text"
                        name="receivedBy"
                        value={formData.receivedBy}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date & Time:</label>
                    <input
                        id="date"
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group form-group-checkbox">
                    <input
                        id="returnable"
                        type="checkbox"
                        name="returnable"
                        checked={formData.returnable}
                        onChange={handleChange}
                        className="form-checkbox"
                    />
                    <label htmlFor="returnable" className="form-checkbox-label">Returnable</label>
                </div>

                {formData.returnable && (
                    <>
                        <div className="form-group">
                            <label htmlFor="expectedReturnDate">Expected Return Date:</label>
                            <input
                                id="expectedReturnDate"
                                type="date"
                                name="expectedReturnDate"
                                value={formData.expectedReturnDate}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="returnedDateTime">Returned Date & Time (Optional):</label>
                            <input
                                id="returnedDateTime"
                                type="datetime-local"
                                name="returnedDateTime"
                                value={formData.returnedDateTime}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="assetCondition">Asset Condition (Optional):</label>
                            <input
                                id="assetCondition"
                                type="text"
                                name="assetCondition"
                                value={formData.assetCondition}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}> {/* Ensure description spans all columns */}
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="form-control description-textarea"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/movements')}
                        className="cancel-button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? 'Updating...' : 'Update Movement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMovement;