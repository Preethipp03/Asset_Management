import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMovement = () => {
  const [assetNameBySerial, setAssetNameBySerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    const fetchAssetBySerial = async () => {
      const serial = formData.serialNumber.trim();
      if (!serial) {
        setFormData((prev) => ({ ...prev, assetId: '' }));
        setAssetNameBySerial('');
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/assets/serial/${serial}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.length > 0) {
          const asset = res.data[0];
          setFormData((prev) => ({
            ...prev,
            assetId: asset._id || '',
          }));
          setAssetNameBySerial(asset.name || '');
        } else {
          setFormData((prev) => ({ ...prev, assetId: '' }));
          setAssetNameBySerial('');
        }
      } catch (error) {
        setFormData((prev) => ({ ...prev, assetId: '' }));
        setAssetNameBySerial('');
      }
    };

    fetchAssetBySerial();
  }, [formData.serialNumber, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.assetId ||
      !formData.serialNumber.trim() ||
      !formData.movementFrom.trim() ||
      !formData.movementTo.trim() ||
      !formData.movementType ||
      !formData.dispatchedBy.trim() ||
      !formData.receivedBy.trim() ||
      !formData.date
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (formData.returnable && !formData.expectedReturnDate) {
      alert('Expected return date is required when returnable is checked.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5000/movements',
        {
          assetId: formData.assetId,
          serialNumber: formData.serialNumber.trim(),
          movementFrom: formData.movementFrom.trim(),
          movementTo: formData.movementTo.trim(),
          movementType: formData.movementType,
          dispatchedBy: formData.dispatchedBy.trim(),
          receivedBy: formData.receivedBy.trim(),
          date: new Date(formData.date).toISOString(),
          returnable: formData.returnable,
          expectedReturnDate: formData.returnable
            ? new Date(formData.expectedReturnDate).toISOString()
            : null,
          returnedDateTime: formData.returnedDateTime
            ? new Date(formData.returnedDateTime).toISOString()
            : null,
          assetCondition: formData.assetCondition.trim() || '',
          description: formData.description.trim() || '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movement recorded successfully');

      setFormData({
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
      setAssetNameBySerial('');
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
            value={assetNameBySerial}
            placeholder="Asset Name"
            readOnly
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
            <>
              <input
                className="add-maintenance-input"
                type="date"
                name="expectedReturnDate"
                value={formData.expectedReturnDate}
                onChange={handleChange}
                required
                placeholder="Expected Return Date"
              />

              <input
                className="add-maintenance-input"
                type="datetime-local"
                name="returnedDateTime"
                value={formData.returnedDateTime}
                onChange={handleChange}
                placeholder="Returned Date & Time"
              />
            </>
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
