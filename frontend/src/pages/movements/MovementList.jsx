import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios'; // Make sure this path is correct

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
      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%', maxWidth: 1000 }}>
        <thead>
          <tr>
            <th>Asset Name</th>
            <th>From</th>
            <th>To</th>
            <th>Inside/Outside</th>
            <th>DateTime</th>
            <th>Dispatched By</th>
            <th>Received By</th>
            <th>Returnable</th>
            <th>Expected Return</th>
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
              <td>{new Date(m.date).toLocaleString()}</td>
              <td>{m.dispatchedBy}</td>
              <td>{m.receivedBy}</td>
              <td>{m.returnable ? 'Yes' : 'No'}</td>
              <td>{m.returnable && m.expectedReturnDate ? new Date(m.expectedReturnDate).toLocaleDateString() : '-'}</td>
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
              <td colSpan="10" style={{ textAlign: 'center' }}>No movements found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovementList;
