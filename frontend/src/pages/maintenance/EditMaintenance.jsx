import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AddMaintenance.css';

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    assetName: '',
    serialNumber: '',
    maintenanceType: 'preventive',
    scheduledDate: '',
    nextScheduledDate: '',
    completedDate: '',
    status: 'scheduled',
    technicianInHouse: '',
    technicianVendor: '',
    description: '',
  });

  const [loading, setLoading] = useState({
    fetching: true,
    updating: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const verifyAndLoadRecord = async () => {
      try {
        // First verify the record exists
        const debugRes = await axios.get(`http://localhost:5000/debug-record/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDebugInfo(debugRes.data);
        
        if (!debugRes.data.exists) {
          setError(`Record with ID ${id} not found in database`);
          setLoading(prev => ({ ...prev, fetching: false }));
          return;
        }

        // If exists, load the record data
        const res = await axios.get(`http://localhost:5000/maintenance/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setForm({
          assetName: res.data.assetName || '',
          serialNumber: res.data.serialNumber || '',
          maintenanceType: res.data.maintenanceType || 'preventive',
          scheduledDate: formatDateForInput(res.data.scheduledDate),
          nextScheduledDate: formatDateForInput(res.data.nextScheduledDate),
          completedDate: formatDateForInput(res.data.completedDate),
          status: res.data.status || 'scheduled',
          technicianInHouse: res.data.technicianInHouse || '',
          technicianVendor: res.data.technicianVendor || '',
          description: res.data.description || '',
        });

      } catch (err) {
        console.error('Load error:', err);
        setError(`Failed to load record: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, fetching: false }));
      }
    };

    verifyAndLoadRecord();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!form.technicianInHouse.trim()) {
      setError('In-house technician is required');
      return;
    }

    if (form.status === 'completed' && !form.completedDate) {
      setError('Completed date is required when status is "completed"');
      return;
    }

    setLoading(prev => ({ ...prev, updating: true }));

    try {
      // Prepare dates for backend
      const prepareDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Adjust for timezone
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString();
      };

      const payload = {
        assetName: form.assetName.trim(),
        serialNumber: form.serialNumber.trim(),
        maintenanceType: form.maintenanceType,
        scheduledDate: prepareDate(form.scheduledDate),
        nextScheduledDate: prepareDate(form.nextScheduledDate),
        completedDate: prepareDate(form.completedDate),
        status: form.status,
        description: form.description.trim(),
        technicianInHouse: form.technicianInHouse.trim(),
        technicianVendor: form.technicianVendor?.trim() || null,
      };

      await axios.put(
        `http://localhost:5000/maintenance/${id}`,
        payload,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Maintenance record updated successfully!');
      setTimeout(() => navigate('/maintenance'), 1500);

    } catch (err) {
      console.error('Update error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to update maintenance record'
      );
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  if (loading.fetching) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading maintenance details...</p>
      </div>
    );
  }

  if (error && (error.includes('not found') || error.includes('Invalid ID'))) {
    return (
      <div className="error-container">
        <h2>Record Not Found</h2>
        <p>{error}</p>
        <p>ID: {id}</p>
        <button 
          onClick={() => navigate('/maintenance')}
          className="btn-primary"
        >
          Back to Maintenance List
        </button>
      </div>
    );
  }

  return (
    <div className="maintenance-form-container">
      <h1>Edit Maintenance Record</h1>
      
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success!</strong> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Asset Information */}
          <div className="form-section">
            <h3>Asset Information</h3>
            <div className="form-group">
              <label>Asset Name *</label>
              <input
                type="text"
                name="assetName"
                value={form.assetName}
                onChange={handleChange}
                required
                disabled={loading.updating}
              />
            </div>

            <div className="form-group">
              <label>Serial Number *</label>
              <input
                type="text"
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                required
                disabled={loading.updating}
              />
            </div>
          </div>

          {/* Maintenance Details */}
          <div className="form-section">
            <h3>Maintenance Details</h3>
            <div className="form-group">
              <label>Type *</label>
              <select
                name="maintenanceType"
                value={form.maintenanceType}
                onChange={handleChange}
                required
                disabled={loading.updating}
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                disabled={loading.updating}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Dates Section */}
          <div className="form-section">
            <h3>Schedule</h3>
            <div className="form-group">
              <label>Scheduled Date *</label>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                required
                disabled={loading.updating}
              />
            </div>

            <div className="form-group">
              <label>Next Scheduled Date</label>
              <input
                type="date"
                name="nextScheduledDate"
                value={form.nextScheduledDate}
                onChange={handleChange}
                disabled={loading.updating}
              />
            </div>

            {form.status === 'completed' && (
              <div className="form-group">
                <label>Completed Date *</label>
                <input
                  type="date"
                  name="completedDate"
                  value={form.completedDate}
                  onChange={handleChange}
                  required={form.status === 'completed'}
                  disabled={loading.updating}
                />
              </div>
            )}
          </div>

          {/* Technician Information */}
          <div className="form-section">
            <h3>Technician Details</h3>
            <div className="form-group">
              <label>In-House Technician *</label>
              <input
                type="text"
                name="technicianInHouse"
                value={form.technicianInHouse}
                onChange={handleChange}
                required
                disabled={loading.updating}
              />
            </div>

            <div className="form-group">
              <label>Vendor Technician</label>
              <input
                type="text"
                name="technicianVendor"
                value={form.technicianVendor}
                onChange={handleChange}
                disabled={loading.updating}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-section-full">
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                disabled={loading.updating}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/maintenance')}
            className="btn-secondary"
            disabled={loading.updating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading.updating}
          >
            {loading.updating ? (
              <>
                <span className="spinner-small"></span> Updating...
              </>
            ) : (
              'Update Maintenance'
            )}
          </button>
        </div>
      </form>

      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="debug-panel">
          <h3>Debug Information</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <p>Frontend ID: {id}</p>
          <p>Is ID valid: {debugInfo.exists ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default EditMaintenance;