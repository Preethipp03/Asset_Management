import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMovement = () => {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    movementFrom: '',
    movementTo: '',
    movementType: '',
    dispatchedBy: '',
    receivedBy: '',
    date: '',
    returnable: false,
    expectedReturnDate: '',
    notes: '',
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

    // Validation
    if (
      !formData.assetId ||
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

    // Convert datetime-local string to ISO string
    // formData.date is like "2025-05-18T14:30"
    const isoDate = new Date(formData.date).toISOString();

    // expectedReturnDate is date only "YYYY-MM-DD"
    const isoExpectedReturnDate = formData.expectedReturnDate
      ? new Date(formData.expectedReturnDate).toISOString()
      : null;

    try {
      await axios.post(
        'http://localhost:5000/movements',
        {
          assetId: formData.assetId,
          movementFrom: formData.movementFrom.trim(),
          movementTo: formData.movementTo.trim(),
          movementType: formData.movementType, // send as 'inside_building' or 'outside_building'
          dispatchedBy: formData.dispatchedBy.trim(),
          receivedBy: formData.receivedBy.trim(),
          date: isoDate,
          returnable: formData.returnable,
          expectedReturnDate: formData.returnable ? isoExpectedReturnDate : null,
          notes: formData.notes.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movement recorded successfully');
      setFormData({
        assetId: '',
        movementFrom: '',
        movementTo: '',
        movementType: '',
        dispatchedBy: '',
        receivedBy: '',
        date: '',
        returnable: false,
        expectedReturnDate: '',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to record movement', err);
      alert('Failed to record movement');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Returnable:
        <input
          type="checkbox"
          name="returnable"
          checked={formData.returnable}
          onChange={handleChange}
        />
      </label>

      {formData.returnable && (
        <label>
          Expected Return Date:
          <input
            type="date"
            name="expectedReturnDate"
            value={formData.expectedReturnDate}
            onChange={handleChange}
            required={formData.returnable}
          />
        </label>
      )}

      <label>
        Notes:
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </label>

      <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>Add Movement</button>
    </form>
  );
};

export default AddMovement;
