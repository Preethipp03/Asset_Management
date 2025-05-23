import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AddAssets.css'; // ✅ Make sure this is imported

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/assets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssets(res.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
        alert('Failed to fetch assets.');
      }
    };

    fetchAssets();
  }, [token, location]);

  const deleteAsset = async (id) => {
    if (!window.confirm('Are you sure to delete this asset?')) return;
    try {
      await axios.delete(`http://localhost:5000/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(assets.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert('Failed to delete asset.');
    }
  };

  return (
    <div className="asset-list-container">
      <div className="asset-list-card">
        <div className="asset-list-header">
          <h2>Assets</h2>
          <Link to="/assets/add">
            <button>Add Asset</button>
          </Link>
        </div>

        <table className="asset-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.location}</td>
                <td>{a.status || 'N/A'}</td>
                <td>
                  <Link to={`/assets/edit/${a._id}`}>
                    <button>Edit</button>
                  </Link>
                  <Link to={`/assets/view/${a._id}`}>
                    <button>View</button>
                  </Link>
                  <button
                    className="delete"
                    onClick={() => deleteAsset(a._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetList;
