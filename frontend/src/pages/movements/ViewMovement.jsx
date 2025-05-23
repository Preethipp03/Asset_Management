import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ViewMovement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovement = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/movements/${id}`);
        setMovement(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch movement');
      } finally {
        setLoading(false);
      }
    };

    fetchMovement();
  }, [id]);

  if (loading) return <div>Loading movement details...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!movement) return <div>No movement found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Movement Details</h2>
      <dl>
        <dt><strong>Asset Name:</strong></dt>
        <dd>{movement.assetName || movement.assetId || 'N/A'}</dd>

        <dt><strong>From:</strong></dt>
        <dd>{movement.movementFrom || 'N/A'}</dd>

        <dt><strong>To:</strong></dt>
        <dd>{movement.movementTo || 'N/A'}</dd>

        <dt><strong>Movement Type:</strong></dt>
        <dd>{movement.movementType === 'inside_building' ? 'Inside Building' : 'Outside Building'}</dd>

        <dt><strong>Dispatched By:</strong></dt>
        <dd>{movement.dispatchedBy || 'N/A'}</dd>

        <dt><strong>Received By:</strong></dt>
        <dd>{movement.receivedBy || 'N/A'}</dd>

        <dt><strong>Movement Date:</strong></dt>
        <dd>{movement.date ? new Date(movement.date).toLocaleString() : 'N/A'}</dd>

        <dt><strong>Returnable:</strong></dt>
        <dd>{movement.returnable ? 'Yes' : 'No'}</dd>

        {movement.returnable && (
          <>
            <dt><strong>Expected Return Date:</strong></dt>
            <dd>{movement.expectedReturnDate ? new Date(movement.expectedReturnDate).toLocaleDateString() : 'N/A'}</dd>
          </>
        )}

        <dt><strong>Returned Date & Time:</strong></dt>
        <dd>{movement.returnedDateTime ? new Date(movement.returnedDateTime).toLocaleString() : 'N/A'}</dd>

        <dt><strong>Asset Condition:</strong></dt>
        <dd>{movement.assetCondition || 'N/A'}</dd>

        <dt><strong>Description:</strong></dt>
        <dd>{movement.description || 'N/A'}</dd>
      </dl>

      <button onClick={() => navigate(-1)} style={{ marginTop: '20px', cursor: 'pointer' }}>
        Back
      </button>
    </div>
  );
};

export default ViewMovement;
