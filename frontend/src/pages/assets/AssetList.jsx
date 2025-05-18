import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const token = localStorage.getItem('token');
  const location = useLocation(); // 👈 Track route changes

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
  }, [token, location]); // 👈 Triggers on token or location change

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
    <div style={{ padding: '20px' }}>
      <h2>Assets</h2>
      <Link to="/assets/add">
        <button>Add Asset</button>
      </Link>
      
      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%', maxWidth: 700 }}>
        <thead>
          <tr>
            <th>Name</th><th>Location</th><th>Status</th><th>Actions</th>
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

                <button onClick={() => deleteAsset(a._id)} style={{ marginLeft: '10px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No assets found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetList;
