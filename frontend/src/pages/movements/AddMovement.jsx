import React, { useState } from 'react';
import axios from 'axios';

const AddMovement = () => {
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
          date: new Date(date).toISOString(),
          returnable,
          expectedReturnDate: returnable ? new Date(expectedReturnDate).toISOString() : null,
          assetCondition: formData.assetCondition.trim(),
          description: formData.description.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Movement recorded successfully');

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
    } catch (err) {
      alert('Failed to record movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-maintenance-container">
      <div className="add-maintenance-card">
        <h2 className="add-maintenance-title">Add Asset Movement</h2>
        <form className="add-maintenance-form" onSubmit={handleSubmit}>
          <input
            className="add-maintenance-input"
            type="text"
            name="serialNumber"
            placeholder="Serial Number"
            value={formData.serialNumber}
            onChange={handleChange}
            required
            autoComplete="off"
          />

          <input
            className="add-maintenance-input"
            type="text"
            name="assetName"
            placeholder="Asset Name"
            value={formData.assetName}
            onChange={handleChange}
            required
          />

          <input
            className="add-maintenance-input"
            type="text"
            name="movementFrom"
            placeholder="Movement From"
            value={formData.movementFrom}
            onChange={handleChange}
            required
          />

          <input
            className="add-maintenance-input"
            type="text"
            name="movementTo"
            placeholder="Movement To"
            value={formData.movementTo}
            onChange={handleChange}
            required
          />

          <select
            className="add-maintenance-select"
            name="movementType"
            value={formData.movementType}
            onChange={handleChange}
            required
          >
            <option value="">Select Movement Type</option>
            <option value="inside_building">Inside Building</option>
            <option value="outside_building">Outside Building</option>
          </select>

          <input
            className="add-maintenance-input"
            type="text"
            name="dispatchedBy"
            placeholder="Dispatched By"
            value={formData.dispatchedBy}
            onChange={handleChange}
            required
          />

          <input
            className="add-maintenance-input"
            type="text"
            name="receivedBy"
            placeholder="Received By"
            value={formData.receivedBy}
            onChange={handleChange}
            required
          />

          <input
            className="add-maintenance-input"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label className="add-maintenance-checkbox-label">
            <input
              type="checkbox"
              name="returnable"
              checked={formData.returnable}
              onChange={handleChange}
              className="add-maintenance-checkbox"
            />
            Returnable
          </label>

          {formData.returnable && (
            <input
              className="add-maintenance-input"
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              required
              placeholder="Expected Return Date"
            />
          )}

          <input
            className="add-maintenance-input"
            type="text"
            name="assetCondition"
            placeholder="Asset Condition"
            value={formData.assetCondition}
            onChange={handleChange}
          />

          <textarea
            className="add-maintenance-textarea"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />

          <button
            className="add-maintenance-button"
            type="submit"
            disabled={loading}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Submitting...' : 'Add Movement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovement;
