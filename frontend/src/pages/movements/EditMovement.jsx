import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AddMovement.css';

const EditMovement = () => {
  const { id: movementId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    assetName: '',
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
    if (!movementId) {
      setError('Invalid movement ID');
      return;
    }

    if (!token) {
      setError('Not authorized. Please login.');
      return;
    }

    setFetching(true);

    axios
      .get(`http://localhost:5000/movements/${movementId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          assetName: data.assetName || '',
          assetId: data.assetId,
          serialNumber: data.serialNumber || '',
          movementFrom: data.movementFrom,
          movementTo: data.movementTo,
          movementType: data.movementType,
          dispatchedBy: data.dispatchedBy,
          receivedBy: data.receivedBy,
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
          returnable: data.returnable,
          expectedReturnDate: data.expectedReturnDate
            ? new Date(data.expectedReturnDate).toISOString().slice(0, 10)
            : '',
          returnedDateTime: data.returnedDateTime
            ? new Date(data.returnedDateTime).toISOString().slice(0, 16)
            : '',
          assetCondition: data.assetCondition || '',
          description: data.description || '',
        });
        setError('');
      })
      .catch((err) => {
        console.error('Failed to fetch movement data', err);
        setError('Failed to load movement data');
      })
      .finally(() => setFetching(false));
  }, [movementId, token]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (error === 'Invalid movement ID' || error === 'Failed to load movement data') {
          navigate('/movements');
        } else if (error === 'Not authorized. Please login.') {
          navigate('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.assetName.trim() ||
      !formData.serialNumber.trim() ||
      !formData.movementFrom.trim() ||
      !formData.movementTo.trim() ||
      !formData.movementType.trim() ||
      !formData.dispatchedBy.trim() ||
      !formData.receivedBy.trim() ||
      !formData.date
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.returnable && !formData.expectedReturnDate) {
      setError('Expected return date is required when returnable is checked.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/movements/${movementId}`,
        {
          assetName: formData.assetName.trim(),
          assetId: formData.assetId,
          serialNumber: formData.serialNumber.trim(),
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
      setError('Failed to update movement');
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

        {error && <p className="error-msg" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <form className="edit-movement-form" onSubmit={handleSubmit}>
          <label>
            Asset Name:
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              required
              className="edit-movement-input"
            />
          </label>

          <label>
            Serial Number:
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="edit-movement-button"
            >
              {loading ? 'Updating...' : 'Update Movement'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/movements')}
              className="cancel-button"
              style={{
                backgroundColor: '#ccc',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovement;
