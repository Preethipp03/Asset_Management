import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios'; // Use your axios instance with interceptors

const ViewMovement = () => {
  const { id } = useParams();
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
      <p><strong>Asset Name:</strong> {movement.assetName || movement.assetId || 'N/A'}</p>
      <p><strong>From:</strong> {movement.movementFrom || 'N/A'}</p>
      <p><strong>To:</strong> {movement.movementTo || 'N/A'}</p>
      <p><strong>Movement Type:</strong> {movement.movementType === 'inside_building' ? 'Inside Building' : 'Outside Building'}</p>
      <p><strong>Dispatched By:</strong> {movement.dispatchedBy || 'N/A'}</p>
      <p><strong>Received By:</strong> {movement.receivedBy || 'N/A'}</p>
      <p><strong>Movement Date:</strong> {movement.date ? new Date(movement.date).toLocaleString() : 'N/A'}</p>
      <p><strong>Returnable:</strong> {movement.returnable ? 'Yes' : 'No'}</p>
      {movement.returnable && (
        <p><strong>Expected Return Date:</strong> {movement.expectedReturnDate ? new Date(movement.expectedReturnDate).toLocaleDateString() : '-'}</p>
      )}
      <p><strong>Returned Date & Time:</strong> {movement.returnedDateTime ? new Date(movement.returnedDateTime).toLocaleString() : '-'}</p>
      <p><strong>Asset Condition:</strong> {movement.assetCondition || '-'}</p>
      <p><strong>Description:</strong> {movement.description || 'N/A'}</p>
    </div>
  );
};

export default ViewMovement;
