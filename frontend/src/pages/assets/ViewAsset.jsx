import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddAssets.css'; // Make sure this import is present

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

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await axios.delete(`http://localhost:5000/assets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Asset deleted successfully!');
                navigate('/assets'); // Navigate back to assets list after deletion
            } catch (error) {
                alert('Failed to delete asset');
                console.error('Delete error:', error);
            }
        }
    };

    if (!asset) {
        return <div className="loading-text">Loading asset details...</div>;
    }

    return (
        <div className="add-asset-container"> {/* Renamed from add-asset-card for semantic clarity */}
            <h2 className="add-asset-title">Asset Details</h2>
            <div className="add-asset-form"> {/* This now acts as a container for stacked details */}
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
            {/* New section for Edit and Delete buttons */}
            <div className="asset-actions">
                <button className="edit-asset-button" onClick={() => navigate(`/assets/edit/${asset._id}`)}>Edit</button>
                <button className="delete-asset-button" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
};

export default ViewAsset;