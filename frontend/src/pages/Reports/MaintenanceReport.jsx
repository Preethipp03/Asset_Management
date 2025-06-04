import React, { useState } from 'react';
import axios from 'axios';

const backendURL = 'http://localhost:5000';

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
  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Check if any filter is set to enable buttons
  const isFilterSet =
    filters.fromDate ||
    filters.toDate ||
    filters.maintenanceType ||
    filters.status ||
    filters.technician;

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setRecords([]);

    try {
      const token = localStorage.getItem('token');
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(`${backendURL}/maintenance/report`, {
        params,
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([response.data], {
        type: filters.format === 'pdf' ? 'application/pdf' : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance_report.${filters.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecords = async () => {
    setLoading(true);
    setError(null);
    setRecords([]);

    try {
      const token = localStorage.getItem('token');
      const params = { ...filters };
      params.format = 'json';  // <-- Fix: explicitly request JSON format for viewing records
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(`${backendURL}/maintenance/records`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecords(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Maintenance Report</h2>

      <label htmlFor="fromDate" style={{ display: 'block', marginTop: 10 }}>
        From Date:
      </label>
      <input
        type="date"
        id="fromDate"
        name="fromDate"
        value={filters.fromDate}
        onChange={handleChange}
      />

      <label htmlFor="toDate" style={{ display: 'block', marginTop: 10 }}>
        To Date:
      </label>
      <input
        type="date"
        id="toDate"
        name="toDate"
        value={filters.toDate}
        onChange={handleChange}
      />

      <label htmlFor="maintenanceType" style={{ display: 'block', marginTop: 10 }}>
        Maintenance Type:
      </label>
      <select
        id="maintenanceType"
        name="maintenanceType"
        value={filters.maintenanceType}
        onChange={handleChange}
      >
        <option value="">All</option>
        <option value="preventive">Preventive</option>
        <option value="corrective">Corrective</option>
      </select>

      <label htmlFor="status" style={{ display: 'block', marginTop: 10 }}>
        Status:
      </label>
      <select id="status" name="status" value={filters.status} onChange={handleChange}>
        <option value="">All</option>
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>

      <label htmlFor="technician" style={{ display: 'block', marginTop: 10 }}>
        Technician:
      </label>
      <input
        type="text"
        id="technician"
        name="technician"
        value={filters.technician}
        onChange={handleChange}
        placeholder="Technician name"
      />

      <label htmlFor="format" style={{ display: 'block', marginTop: 10 }}>
        Export Format:
      </label>
      <select id="format" name="format" value={filters.format} onChange={handleChange}>
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleExport} disabled={loading || !isFilterSet}>
          {loading ? 'Exporting...' : 'Export Report'}
        </button>

        <button
          onClick={handleViewRecords}
          disabled={loading || !isFilterSet}
          style={{ marginLeft: 10 }}
        >
          {loading ? 'Loading...' : 'View Records'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {error}
        </p>
      )}

      {!loading && records.length === 0 && isFilterSet && (
        <p style={{ marginTop: 20 }}>No records found.</p>
      )}

      {records.length > 0 && (
  <div style={{ marginTop: 30 }}>
    <p>
      <strong>Total Records:</strong> {records.length}
    </p>
    <table
      border="1"
      cellPadding="5"
      style={{ width: '100%', borderCollapse: 'collapse' }}
    >
      <thead>
        <tr>
          <th>Asset Name</th>
          <th>Maintenance Type</th>
          <th>Status</th>
          <th>Scheduled Date</th>
          <th>Technician</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record._id || record.id}>
            <td>{record.assetName}</td>
            <td>{record.maintenanceType}</td>
            <td>{record.status}</td>
            <td>
              {record.scheduledDate
                ? new Date(record.scheduledDate).toLocaleDateString()
                : '-'}
            </td>
            <td>{record.technicianInHouse || record.technicianVendor || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </div>
  );
};

export default MaintenanceReport;
