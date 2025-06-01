import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// The CSS import should ideally be a global one, e.g., in App.js or index.js
// but if you want it component-specific, rename this to match your global CSS file, e.g.,
// import '../styles/FormStyles.css'; // Assuming your global styles are here

const AddMovement = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        serialNumber: '',
        assetName: '',
        movementFrom: '',
        movementTo: '',
        movementType: '',
        dispatchedBy: '',
        receivedBy: '',
        date: '',
        returnable: false,
        expectedReturnDate: '',
        assetCondition: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Added error state for better feedback
    const [success, setSuccess] = useState(''); // Added success state

    const token = localStorage.getItem('token');

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

        const {
            serialNumber,
            assetName,
            movementFrom,
            movementTo,
            movementType,
            dispatchedBy,
            receivedBy,
            date,
            returnable,
            expectedReturnDate,
        } = formData;

        // More user-friendly validation messages
        if (!serialNumber.trim()) {
            setError('Serial Number is required.');
            return;
        }
        if (!assetName.trim()) {
            setError('Asset Name is required.');
            return;
        }
        if (!movementFrom.trim()) {
            setError('Movement From location is required.');
            return;
        }
        if (!movementTo.trim()) {
            setError('Movement To location is required.');
            return;
        }
        if (!movementType) {
            setError('Movement Type is required.');
            return;
        }
        if (!dispatchedBy.trim()) {
            setError('Dispatched By field is required.');
            return;
        }
        if (!receivedBy.trim()) {
            setError('Received By field is required.');
            return;
        }
        if (!date) {
            setError('Date & Time is required.');
            return;
        }

        if (returnable && !expectedReturnDate) {
            setError('Expected return date is required when the asset is returnable.');
            return;
        }

        setLoading(true);

        try {
            console.log('Submitting movement:', formData); // Debug log
            await axios.post(
                'http://localhost:5000/movements',
                {
                    serialNumber: serialNumber.trim(),
                    assetName: assetName.trim(),
                    movementFrom: movementFrom.trim(),
                    movementTo: movementTo.trim(),
                    movementType,
                    dispatchedBy: dispatchedBy.trim(),
                    receivedBy: receivedBy.trim(),
                    date: new Date(date).toISOString(), // Ensure date is ISO format
                    returnable,
                    // Send null if not returnable or if returnable but date is empty
                    expectedReturnDate: returnable && expectedReturnDate ? new Date(expectedReturnDate).toISOString() : null,
                    assetCondition: formData.assetCondition.trim(),
                    description: formData.description.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess('Movement recorded successfully!');
            // Reset form for next entry or navigate
            setFormData({
                serialNumber: '',
                assetName: '',
                movementFrom: '',
                movementTo: '',
                movementType: '',
                dispatchedBy: '',
                receivedBy: '',
                date: '',
                returnable: false,
                expectedReturnDate: '',
                assetCondition: '',
                description: '',
            });
            // Navigate to movements list after a short delay
            setTimeout(() => {
                navigate('/movements');
            }, 1500);
        } catch (err) {
            console.error('Failed to record movement:', err.response?.data || err.message);
            setError('Failed to record movement: ' + (err.response?.data?.error || 'An unexpected error occurred.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        // Use the main container class for consistent padding and card-like appearance
        <div className="edit-movement-container">
            <div className="header-with-back-button">
                <button onClick={() => navigate('/movements')} className="back-button">
                    &larr; Back to Movements
                </button>
                {/* Use the common title class */}
                <h2 className="edit-movement-title">Record New Asset Movement</h2>
            </div>

            {/* Display messages using common classes */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            {/* Use the common form class */}
            <form className="edit-movement-form" onSubmit={handleSubmit}>

                {/* All form groups should use "form-group" */}
                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        id="serialNumber"
                        className="form-control" // Use "form-control"
                        type="text"
                        name="serialNumber"
                        placeholder="e.g., SN12345"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="assetName">Asset Name:</label>
                    <input
                        id="assetName"
                        className="form-control"
                        type="text"
                        name="assetName"
                        placeholder="e.g., Laptop, Projector"
                        value={formData.assetName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementFrom">Movement From:</label>
                    <input
                        id="movementFrom"
                        className="form-control"
                        type="text"
                        name="movementFrom"
                        placeholder="e.g., Store Room A, Dept. XYZ"
                        value={formData.movementFrom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementTo">Movement To:</label>
                    <input
                        id="movementTo"
                        className="form-control"
                        type="text"
                        name="movementTo"
                        placeholder="e.g., Office 301, Site B"
                        value={formData.movementTo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="movementType">Movement Type:</label>
                    <select
                        id="movementType"
                        className="form-control"
                        name="movementType"
                        value={formData.movementType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Movement Type</option>
                        <option value="inside_building">Inside Building</option>
                        <option value="outside_building">Outside Building</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="dispatchedBy">Dispatched By:</label>
                    <input
                        id="dispatchedBy"
                        className="form-control"
                        type="text"
                        name="dispatchedBy"
                        placeholder="Name of Dispatched Person"
                        value={formData.dispatchedBy}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="receivedBy">Received By:</label>
                    <input
                        id="receivedBy"
                        className="form-control"
                        type="text"
                        name="receivedBy"
                        placeholder="Name of Receiver"
                        value={formData.receivedBy}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date & Time:</label>
                    <input
                        id="date"
                        className="form-control"
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* For the checkbox, you might need a slight adjustment in CSS if labels are not side-by-side */}
                <div className="form-group form-group-checkbox">
                    <input
                        id="returnable"
                        type="checkbox"
                        name="returnable"
                        checked={formData.returnable}
                        onChange={handleChange}
                        className="form-checkbox" // Retained your new class, but ensure it's styled in CSS
                    />
                    <label htmlFor="returnable" className="form-checkbox-label">Returnable</label>
                </div>

                {formData.returnable && (
                    <div className="form-group">
                        <label htmlFor="expectedReturnDate">Expected Return Date:</label>
                        <input
                            id="expectedReturnDate"
                            className="form-control"
                            type="date"
                            name="expectedReturnDate"
                            value={formData.expectedReturnDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="assetCondition">Asset Condition (Optional):</label>
                    <input
                        id="assetCondition"
                        className="form-control"
                        type="text"
                        name="assetCondition"
                        placeholder="e.g., Good, Minor Scratches"
                        value={formData.assetCondition}
                        onChange={handleChange}
                    />
                </div>

                {/* Description textarea should span all columns */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                        id="description"
                        className="form-control description-textarea" // Use "form-control" and "description-textarea"
                        name="description"
                        placeholder="Any additional details or notes"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                {/* Form actions (buttons) container */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/movements')} className="cancel-button" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Movement'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMovement;