import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddAssets.css';

const ViewAsset = () => {
  const [asset, setAsset] = useState(null);
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAsset(res.data);
      } catch (error) {
        alert('Failed to load asset details');
        navigate('/assets');
      }
    };
    fetchAsset();
  }, [id, token, navigate]);

  if (!asset) {
    return <div className="loading-text">Loading asset details...</div>;
  }

  return (
    <div className="add-asset-container">
      <div className="add-asset-card">
        <h2 className="add-asset-title">Asset Details</h2>
        <div className="add-asset-form" style={{ gap: '16px' }}>
          <div className="view-asset-field"><strong>Name:</strong> {asset.name}</div>
          <div className="view-asset-field"><strong>Type:</strong> {asset.type}</div>
          <div className="view-asset-field"><strong>Category:</strong> {asset.category}</div>
          <div className="view-asset-field"><strong>Purchase Date:</strong> {asset.purchaseDate?.split('T')[0]}</div>
          <div className="view-asset-field"><strong>Warranty:</strong> {asset.warranty}</div>
          <div className="view-asset-field"><strong>Location:</strong> {asset.location}</div>
          <div className="view-asset-field"><strong>Condition:</strong> {asset.condition}</div>
          <div className="view-asset-field"><strong>Serial Number:</strong> {asset.serialNumber}</div>
          <div className="view-asset-field"><strong>Assigned To:</strong> {asset.assignedTo}</div>
          <div className="view-asset-field"><strong>Status:</strong> {asset.status}</div>
          <div className="view-asset-field"><strong>Description:</strong> {asset.description}</div>
        </div>
      </div>
    </div>
  );
};

export default ViewAsset;
