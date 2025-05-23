import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AddMovement.css';

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

    if (!token) {
      alert('Not authorized. Please login.');
      navigate('/login');
      return;
    }

    setFetching(true);

    const fetchAssets = axios.get('http://localhost:5000/assets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchMovement = axios.get(`http://localhost:5000/movements/${movementId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    Promise.all([fetchAssets, fetchMovement])
      .then(([assetsRes, movementRes]) => {
        setAssets(assetsRes.data);
        const data = movementRes.data;
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
      })
      .catch((err) => {
        console.error('Failed to fetch data', err);
        alert('Failed to load movement or assets data');
        navigate('/movements');
      })
      .finally(() => setFetching(false));
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
    return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Loading movement data...</p>;
  }

  return (
    <div className="edit-movement-wrapper">
      <div className="edit-movement-card">
        <h2 className="edit-movement-title">Edit Movement</h2>
        <form className="edit-movement-form" onSubmit={handleSubmit}>
          <label>
            Asset:
            <input
              type="text"
              value={assetName}
              disabled
              className="edit-movement-input"
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
              className="edit-movement-input"
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
              className="edit-movement-input"
            />
          </label>

          <label>
            Movement Type:
            <select
              name="movementType"
              value={formData.movementType}
              onChange={handleChange}
              required
              className="edit-movement-select"
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
              className="edit-movement-input"
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
              className="edit-movement-input"
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
              className="edit-movement-input"
            />
          </label>

          <label className="edit-movement-checkbox-label">
            <input
              type="checkbox"
              name="returnable"
              checked={formData.returnable}
              onChange={handleChange}
              className="edit-movement-checkbox"
            />
            Returnable
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
                  className="edit-movement-input"
                />
              </label>

              <label>
                Returned Date & Time:
                <input
                  type="datetime-local"
                  name="returnedDateTime"
                  value={formData.returnedDateTime}
                  onChange={handleChange}
                  className="edit-movement-input"
                />
              </label>

              <label>
                Asset Condition:
                <input
                  type="text"
                  name="assetCondition"
                  value={formData.assetCondition}
                  onChange={handleChange}
                  className="edit-movement-input"
                />
              </label>
            </>
          )}

          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="edit-movement-textarea"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="edit-movement-button"
          >
            {loading ? 'Updating...' : 'Update Movement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMovement;
