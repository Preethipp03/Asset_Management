import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMovement = () => {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    serialNumber: '',  // Added here
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
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/assets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssets(res.data);
      } catch (err) {
        console.error('Failed to fetch assets', err);
      }
    };
    if (token) fetchAssets();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic required fields validation including serialNumber (if required)
    if (
      !formData.assetId ||
      !formData.serialNumber.trim() ||  // validate serialNumber if required
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

    // Validate date inputs before formatting
    if (isNaN(new Date(formData.date).getTime())) {
      alert('Invalid date and time.');
      return;
    }
    if (formData.returnable && isNaN(new Date(formData.expectedReturnDate).getTime())) {
      alert('Invalid expected return date.');
      return;
    }
    if (formData.returnedDateTime && isNaN(new Date(formData.returnedDateTime).getTime())) {
      alert('Invalid returned date and time.');
      return;
    }

    const isoDate = new Date(formData.date).toISOString();
    const isoExpectedReturnDate = formData.expectedReturnDate
      ? new Date(formData.expectedReturnDate).toISOString()
      : null;
    const isoReturnedDateTime = formData.returnedDateTime
      ? new Date(formData.returnedDateTime).toISOString()
      : null;

    try {
      await axios.post(
        'http://localhost:5000/movements',
        {
          assetId: formData.assetId,
          serialNumber: formData.serialNumber.trim(),  // Include serialNumber here
          movementFrom: formData.movementFrom.trim(),
          movementTo: formData.movementTo.trim(),
          movementType: formData.movementType,
          dispatchedBy: formData.dispatchedBy.trim(),
          receivedBy: formData.receivedBy.trim(),
          date: isoDate,
          returnable: formData.returnable,
          expectedReturnDate: formData.returnable ? isoExpectedReturnDate : null,
          returnedDateTime: isoReturnedDateTime,
          assetCondition: formData.assetCondition.trim() || '',
          description: formData.description.trim() || '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movement recorded successfully');
      setFormData({
        assetId: '',
        serialNumber: '', // reset serialNumber
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
    } catch (err) {
      console.error('Failed to record movement', err);
      alert('Failed to record movement');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <label>
        Asset:
        <select name="assetId" value={formData.assetId} onChange={handleChange} required>
          <option value="">Select Asset</option>
          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Serial Number:
        <input
          type="text"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Movement From:
        <input
          type="text"
          name="movementFrom"
          value={formData.movementFrom}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Movement To:
        <input
          type="text"
          name="movementTo"
          value={formData.movementTo}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Movement Type:
        <select
          name="movementType"
          value={formData.movementType}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="inside_building">Inside Building</option>
          <option value="outside_building">Outside Building</option>
        </select>
      </label>

      <label>
        Dispatched By:
        <input
          type="text"
          name="dispatchedBy"
          value={formData.dispatchedBy}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Received By:
        <input
          type="text"
          name="receivedBy"
          value={formData.receivedBy}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Date & Time:
        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
      </label>

      <label>
        Returnable:
        <input type="checkbox" name="returnable" checked={formData.returnable} onChange={handleChange} />
      </label>

      {formData.returnable && (
        <>
          <label>
            Expected Return Date:
            <input
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Returned Date & Time:
            <input
              type="datetime-local"
              name="returnedDateTime"
              value={formData.returnedDateTime}
              onChange={handleChange}
            />
          </label>
        </>
      )}

      <label>
        Asset Condition:
        <input type="text" name="assetCondition" value={formData.assetCondition} onChange={handleChange} />
      </label>

      <label>
        Description:
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
      </label>

      <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
        Add Movement
      </button>
    </form>
  );
};

export default AddMovement;
