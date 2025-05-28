import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddMovement.css'; // Import the new CSS file

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

        // Basic validation (can be enhanced with more robust validation libraries)
        if (
            !serialNumber.trim() ||
            !assetName.trim() ||
            !movementFrom.trim() ||
            !movementTo.trim() ||
            !movementType ||
            !dispatchedBy.trim() ||
            !receivedBy.trim() ||
            !date
        ) {
            alert('Please fill in all required fields.');
            return;
        }

        if (returnable && !expectedReturnDate) {
            alert('Expected return date is required when returnable is checked.');
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
                    expectedReturnDate: returnable ? (expectedReturnDate ? new Date(expectedReturnDate).toISOString() : null) : null,
                    assetCondition: formData.assetCondition.trim(),
                    description: formData.description.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert('Movement recorded successfully!');
            // Reset form or navigate to a list page
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
            navigate('/movements'); // Assuming you have a /movements list page
        } catch (err) {
            console.error('Failed to record movement:', err.response?.data || err.message);
            alert('Failed to record movement: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-movement-container"> {/* Main container */}
            <h2 className="add-movement-title">Record New Asset Movement</h2> {/* Title */}
            <form className="add-movement-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number:</label>
                    <input
                        id="serialNumber"
                        className="form-control"
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

                <div className="form-group form-group-checkbox">
                    <input
                        id="returnable"
                        type="checkbox"
                        name="returnable"
                        checked={formData.returnable}
                        onChange={handleChange}
                        className="form-checkbox" /* New class for checkbox input */
                    />
                    <label htmlFor="returnable" className="form-checkbox-label">Returnable</label> {/* Label next to checkbox */}
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

                <div className="form-group">
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea
                        id="description"
                        className="form-control description-textarea" // Reusing description-textarea class
                        name="description"
                        placeholder="Any additional details or notes"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <div className="form-actions"> {/* Container for buttons */}
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Submitting...' : 'Add Movement'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/movements')} // Navigate back to movements list
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

export default AddMovement;