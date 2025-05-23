import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewMovement = () => {
  const { id } = useParams();
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovement = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token');

        const response = await axios.get(`http://localhost:5000/movements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovement(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovement();
  }, [id]);

  if (loading) return <div>Loading movement details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movement) return <div>No movement found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Movement Details</h2>
      <p><strong>Asset Name:</strong> {movement.assetName || movement.assetId}</p>
      <p><strong>From:</strong> {movement.movementFrom}</p>
      <p><strong>To:</strong> {movement.movementTo}</p>
      <p><strong>Movement Type:</strong> {movement.movementType === 'inside_building' ? 'Inside Building' : 'Outside Building'}</p>
      <p><strong>Dispatched By:</strong> {movement.dispatchedBy}</p>
      <p><strong>Received By:</strong> {movement.receivedBy}</p>
      <p><strong>Movement Date:</strong> {new Date(movement.date).toLocaleString()}</p>
      <p><strong>Returnable:</strong> {movement.returnable ? 'Yes' : 'No'}</p>
      {movement.returnable && (
        <p><strong>Expected Return Date:</strong> {movement.expectedReturnDate ? new Date(movement.expectedReturnDate).toLocaleDateString() : '-'}</p>
      )}
      {movement.returnedDateTime && (
        <p><strong>Returned Date & Time:</strong> {new Date(movement.returnedDateTime).toLocaleString()}</p>
      )}
      {movement.assetCondition && (
        <p><strong>Asset Condition:</strong> {movement.assetCondition}</p>
      )}
      <p><strong>Description:</strong> {movement.description || 'N/A'}</p>
    </div>
  );
};

export default ViewMovement;
