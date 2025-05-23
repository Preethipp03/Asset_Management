import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MovementList = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/movements');
        setMovements(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch movements.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  const deleteMovement = async (id) => {
    if (!window.confirm('Are you sure to delete this movement?')) return;
    try {
      await api.delete(`/movements/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert('Failed to delete movement.');
    }
  };

  if (loading) {
    return <p>Loading movements...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Asset Movements</h2>
      <Link to="/movements/add">
        <button style={{ cursor: 'pointer' }}>Add Movement</button>
      </Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: '20px', width: '100%', maxWidth: 1300, borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope="col">Asset Name</th>
            <th scope="col">Serial Number</th> {/* Now included */}
            <th scope="col">Movement From</th>
            <th scope="col">Movement To</th>
            <th scope="col">Movement Type</th>
            <th scope="col">Dispatched By</th>
            <th scope="col">Received By</th>
            <th scope="col">Movement Date</th>
            <th scope="col">Returnable</th>
            <th scope="col">Expected Return Date</th>
            <th scope="col">Returned Date &amp; Time</th>
            <th scope="col">Asset Condition</th>
            <th scope="col">Description</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan="15" style={{ textAlign: 'center' }}>
                No movements found
              </td>
            </tr>
          ) : (
            movements.map((m, index) => (
              <tr key={m._id}>
                <td>{index + 1}</td>
                <td>{m.assetName}</td>
                <td>{m.serialNumber || '-'}</td>
                <td>{m.movementFrom}</td>
                <td>{m.movementTo}</td>
                <td>{m.movementType === 'inside_building' ? 'Inside Building' : 'Outside Building'}</td>
                <td>{m.dispatchedBy}</td>
                <td>{m.receivedBy}</td>
                <td>{new Date(m.date).toLocaleString()}</td>
                <td>{m.returnable ? 'Yes' : 'No'}</td>
                <td>{m.returnable && m.expectedReturnDate ? new Date(m.expectedReturnDate).toLocaleDateString() : '-'}</td>
                <td>{m.returnedDateTime ? new Date(m.returnedDateTime).toLocaleString() : '-'}</td>
                <td>{m.assetCondition || '-'}</td>
                <td>{m.description || '-'}</td>
                <td>
                  <Link to={`/movements/edit/${m._id}`}>
                    <button
                      aria-label={`Edit movement for asset ${m.assetName}`}
                      style={{ cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteMovement(m._id)}
                    aria-label={`Delete movement for asset ${m.assetName}`}
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovementList;
