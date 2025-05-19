import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EditMovement = () => {
  const { id: movementId } = useParams();
  const [assets, setAssets] = useState([]);
  const [assetName, setAssetName] = useState('');
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

    const fetchMovement = async () => {
      try {
        if (!movementId) return;

        const res = await axios.get(`http://localhost:5000/movements/${movementId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setFormData({
          assetId: data.assetId,
          movementFrom: data.movementFrom,
          movementTo: data.movementTo,
          movementType: data.movementType,
          dispatchedBy: data.dispatchedBy,
          receivedBy: data.receivedBy,
          date: data.date ? new Date(data.date).toISOString().slice(0, 10) : '',
          returnable: data.returnable,
          expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate).toISOString().slice(0, 10) : '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Failed to fetch movement', err);
      }
    };

    if (token) {
      fetchAssets();
      fetchMovement();
    }
  }, [movementId, token]);

  // Update assetName when assetId or assets list changes
  useEffect(() => {
    if (formData.assetId && assets.length) {
      const foundAsset = assets.find(a => a._id === formData.assetId);
      setAssetName(foundAsset ? foundAsset.name : '');
    }
  }, [formData.assetId, assets]);

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
      !formData.movementFrom.trim() ||
      !formData.movementTo.trim() ||
      !formData.movementType.trim() ||
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

    try {
      await axios.put(
        `http://localhost:5000/movements/${movementId}`,
        {
          assetId: formData.assetId,
          movementFrom: formData.movementFrom.trim(),
          movementTo: formData.movementTo.trim(),
          movementType: formData.movementType.trim(),
          dispatchedBy: formData.dispatchedBy.trim(),
          receivedBy: formData.receivedBy.trim(),
          date: new Date(formData.date),
          returnable: formData.returnable,
          expectedReturnDate: formData.returnable ? new Date(formData.expectedReturnDate) : null,
          description: formData.description.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movement updated successfully');
    } catch (err) {
      console.error('Failed to update movement', err);
      alert('Failed to update movement');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      {/* Show asset name read-only */}
      {assetName && (
        <p><strong>Asset Name:</strong> {assetName}</p>
      )}

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
        Date:
        <input
          type="date"
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
        description:
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </label>

      <button type="submit">Update Movement</button>
    </form>
  );
};

export default EditMovement;
