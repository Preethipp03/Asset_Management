import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditMovement = () => {
  const { id: movementId } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [assetName, setAssetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    returnedDateTime: '',
    assetCondition: '',
    description: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!movementId) {
      alert('Invalid movement ID');
      navigate('/movements');
      return;
    }

    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/assets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssets(res.data);
      } catch (err) {
        console.error('Failed to fetch assets', err);
        alert('Failed to fetch assets');
      }
    };

    const fetchMovement = async () => {
      try {
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
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
          returnable: data.returnable,
          expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate).toISOString().slice(0, 10) : '',
          returnedDateTime: data.returnedDateTime ? new Date(data.returnedDateTime).toISOString().slice(0, 16) : '',
          assetCondition: data.assetCondition || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Failed to fetch movement', err);
        alert('Failed to fetch movement data');
        navigate('/movements');
      } finally {
        setFetching(false);
      }
    };

    if (token) {
      fetchAssets();
      fetchMovement();
    } else {
      alert('Not authorized. Please login.');
      navigate('/login');
    }
  }, [movementId, token, navigate]);

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

    setLoading(true);
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
          returnedDateTime: formData.returnedDateTime ? new Date(formData.returnedDateTime) : null,
          assetCondition: formData.assetCondition.trim(),
          description: formData.description.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Movement updated successfully');
      navigate('/movements');
    } catch (err) {
      console.error('Failed to update movement', err);
      alert('Failed to update movement');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p>Loading movement data...</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label>
        Asset:
        {/* Show asset name as disabled input so user cannot change */}
        <input
          type="text"
          value={assetName}
          disabled
          style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '6px' }}
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

          <label>
            Asset Condition:
            <input
              type="text"
              name="assetCondition"
              value={formData.assetCondition}
              onChange={handleChange}
            />
          </label>
        </>
      )}

      <label>
        Description:
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
      </label>

      <button type="submit" disabled={loading} style={{ padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Updating...' : 'Update Movement'}
      </button>
    </form>
  );
};

export default EditMovement;
