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

  // Fetch asset by serial number
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
        console.error('Asset not found for serial number', error);
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
      console.error('Failed to record movement', err);
      alert('Failed to record movement');
    } finally {
      setLoading(false);
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
        Serial Number:
        <input
          type="text"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          required
          autoComplete="off"
        />
      </label>

      <label>
        Asset Name:
        <input type="text" value={assetNameBySerial} readOnly />
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
        <input
          type="text"
          name="assetCondition"
          value={formData.assetCondition}
          onChange={handleChange}
        />
      </label>

      <label>
        Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </label>

      <button
        type="submit"
        style={{ padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add Movement'}
      </button>
    </form>
  );
};

export default AddMovement;
