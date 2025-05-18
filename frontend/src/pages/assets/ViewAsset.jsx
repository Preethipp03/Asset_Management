// src/pages/assets/ViewAsset.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      } catch {
        alert('Failed to load asset');
        navigate('/assets');
      }
    };
    fetchAsset();
  }, [id, token, navigate]);

  if (!asset) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Asset Details</h2>
      <p><strong>Name:</strong> {asset.name}</p>
      <p><strong>Type:</strong> {asset.type}</p>
      <p><strong>Category:</strong> {asset.category}</p>
      <p><strong>Price:</strong> ₹{asset.price}</p>
      <p><strong>Purchase Date:</strong> {asset.purchaseDate?.split('T')[0]}</p>
      <p><strong>Warranty:</strong> {asset.warranty}</p>
      <p><strong>Location:</strong> {asset.location}</p>
      <p><strong>Condition:</strong> {asset.condition}</p>
      <p><strong>Serial Number:</strong> {asset.serialNumber}</p>
      <p><strong>Assigned To:</strong> {asset.assignedTo}</p>
      <p><strong>Status:</strong> {asset.status}</p>
      <p><strong>Notes:</strong> {asset.notes}</p>
    </div>
  );
};

export default ViewAsset;
