import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './AddMovement.css'; // 🔄 Use separate CSS for MovementList

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
        setError(err.response?.data?.error || err.message || 'Failed to fetch movements.');
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

  return (
    <div className="movement-list-container">
      <div className="movement-list-card">
        <div className="movement-list-header">
          <h2>Asset Movements</h2>
          <Link to="/movements/add">
            <button>Add Movement</button>
          </Link>
        </div>

        {error && <p className="movement-error">{error}</p>}
        {loading ? (
          <p>Loading movements...</p>
        ) : (
          <div className="movement-table-wrapper">
            <table className="movement-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Asset Name</th>
                  <th>Serial Number</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Type</th>
                  <th>Dispatched By</th>
                  <th>Received By</th>
                  <th>Date</th>
                  <th>Returnable</th>
                  <th>Expected Return</th>
                  <th>Returned At</th>
                  <th>Condition</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="text-center">No movements found</td>
                  </tr>
                ) : (
                  movements.map((m, index) => (
                    <tr key={m._id}>
                      <td>{index + 1}</td>
                      <td>{m.assetName}</td>
                      <td>{m.serialNumber || '-'}</td>
                      <td>{m.movementFrom}</td>
                      <td>{m.movementTo}</td>
                      <td>{m.movementType === 'inside_building' ? 'Inside' : 'Outside'}</td>
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
                          <button>Edit</button>
                        </Link>
                        <button className="delete" onClick={() => deleteMovement(m._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementList;
