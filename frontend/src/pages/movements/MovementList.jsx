import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const MovementList = () => {
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await api.get('/movements');
        setMovements(res.data);
      } catch (err) {
        alert('Failed to fetch movements.');
      }
    };
    fetchMovements();
  }, []);

  const deleteMovement = async (id) => {
    if (!window.confirm('Are you sure to delete this movement?')) return;
    try {
      await api.delete(`/movements/${id}`);
      setMovements(movements.filter((m) => m._id !== id));
    } catch {
      alert('Failed to delete movement.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Asset Movements</h2>
      <Link to="/movements/add">
        <button>Add Movement</button>
      </Link>
      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%', maxWidth: 1300 }}>
        <thead>
          <tr>
            <th>Asset Name</th>
            <th>Movement From</th>
            <th>Movement To</th>
            <th>Movement Type</th>
            <th>Dispatched By</th>
            <th>Received By</th>
            <th>Movement Date</th>
            <th>Returnable</th>
            <th>Expected Return Date</th>
            <th>Returned Date & Time</th>
            <th>Asset Condition</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m._id}>
              <td>{m.assetName}</td>
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
              <td>{m.description}</td>
              <td>
                <Link to={`/movements/edit/${m._id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => deleteMovement(m._id)} style={{ marginLeft: '10px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {movements.length === 0 && (
            <tr>
              <td colSpan="13" style={{ textAlign: 'center' }}>No movements found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovementList;
