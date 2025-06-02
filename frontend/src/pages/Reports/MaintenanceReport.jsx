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

  // New state to store fetched records for viewing
  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

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

  // Handler for "View Records" button
  const handleViewRecords = async () => {
    setLoading(true);
    setError(null);
    setRecords([]);

    try {
      const token = localStorage.getItem('token');
      const params = { ...filters };
      delete params.format; // no need to send format when fetching JSON
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      // Use your existing backend endpoint that returns JSON records
      const response = await axios.get(`${backendURL}/maintenance/records`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecords(response.data); // set the fetched records

    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
        <input
          type="text"
          name="technician"
          value={filters.technician}
          onChange={handleChange}
          placeholder="Technician name"
        />
      </label>

      <label>
        Export Format:
        <select name="format" value={filters.format} onChange={handleChange}>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
      </label>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleExport} disabled={loading}>
          {loading ? 'Exporting...' : 'Export Report'}
        </button>

        <button onClick={handleViewRecords} disabled={loading} style={{ marginLeft: 10 }}>
          {loading ? 'Loading...' : 'View Records'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {records.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Records</h3>
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  <td>{new Date(record.scheduledDate).toLocaleDateString()}</td>
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
