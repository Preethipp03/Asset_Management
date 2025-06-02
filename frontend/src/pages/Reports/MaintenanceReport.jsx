import React, { useState } from 'react';
import axios from 'axios';

const backendURL = 'http://localhost:5000';  // Your backend URL & port

const MaintenanceReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    maintenanceType: '',
    status: '',
    technician: '',
    format: 'csv',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');  // Get JWT token

      // Build query params
      const params = { ...filters };

      // Remove empty params to keep URL clean
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(`${backendURL}/maintenance/report`, {
        params,
        responseType: 'blob', // important for file download
        headers: {
          Authorization: `Bearer ${token}`,  // Pass token in header
        },
      });

      // Create downloadable file blob
      const blob = new Blob([response.data], {
        type: filters.format === 'pdf' ? 'application/pdf' : 'text/csv',
      });

      // Create link and click to download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `maintenance_report.${filters.format}`;
      link.click();

    } catch (err) {
      setError('Error exporting report: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Maintenance Report</h2>

      <label>
        From Date:
        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} />
      </label>

      <label>
        To Date:
        <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} />
      </label>

      <label>
        Maintenance Type:
        <select name="maintenanceType" value={filters.maintenanceType} onChange={handleChange}>
          <option value="">All</option>
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
        </select>
      </label>

      <label>
        Status:
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </label>

      <label>
        Technician:
        <input type="text" name="technician" value={filters.technician} onChange={handleChange} placeholder="Technician name" />
      </label>

      <label>
        Export Format:
        <select name="format" value={filters.format} onChange={handleChange}>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
      </label>

      <button onClick={handleExport} disabled={loading} style={{ marginTop: 20 }}>
        {loading ? 'Exporting...' : 'Export Report'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default MaintenanceReport;
