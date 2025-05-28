import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AssetList.css'; // Make sure this path is correct

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
    <div className="asset-list-wrapper"> {/* Renamed container for clarity, less prone to general page styling */}
      <div className="asset-list-header">
        <h2>Assets</h2>
        <Link to="/assets/add">
          <button className="add-asset-button">Add Asset</button>
        </Link>
      </div>

      <div className="asset-table-container"> {/* New div to manage table overflow if needed */}
        <table className="asset-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>{a.location}</td>
                <td className="asset-actions"> {/* Add a class for actions column for flexible styling */}
                  <Link to={`/assets/edit/${a._id}`}>
                    <button className="edit-button">Edit</button>
                  </Link>
                  <Link to={`/assets/view/${a._id}`}>
                    <button className="view-button">View</button>
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => deleteAsset(a._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
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