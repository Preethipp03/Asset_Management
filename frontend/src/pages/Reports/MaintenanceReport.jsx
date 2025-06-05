import React, { useState } from 'react';
import axios from 'axios';
import './MaintenanceReport.css';

const backendURL = 'http://172.16.0.36:5000';

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

      const response = await axios.get(`${backendURL}/maintenance/records`, {
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
      const params = { ...filters, format: 'json' };
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

  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      maintenanceType: '',
      status: '',
      technician: '',
      format: 'csv',
    });
    setRecords([]);
    setError(null);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="maintenance-report-wrapper">
      <header className="header-with-back-button">
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
        <h1 className="edit-movement-title">Maintenance Report</h1>
      </header>

      <form className="edit-movement-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          From Date:
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
          />
        </label>

        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Maintenance Type:
          <input
            type="text"
            name="maintenanceType"
            value={filters.maintenanceType}
            onChange={handleChange}
            placeholder="Maintenance Type"
          />
        </label>

        <label>
          Status:
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="inprogress">In Progress</option>
          </select>
        </label>

        <label>
          Technician:
          <input
            type="text"
            name="technician"
            value={filters.technician}
            onChange={handleChange}
            placeholder="Technician"
          />
        </label>

        <label>
          Export Format:
          <select
            name="format"
            value={filters.format}
            onChange={handleChange}
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
      </form>

      <div className="button-group">
        <button
          className="submit-button"
          onClick={handleExport}
          disabled={loading || !isFilterSet}
        >
          {loading ? 'Exporting...' : 'Export Report'}
        </button>

        <button
          className="submit-button"
          style={{ backgroundColor: '#007bff' }}
          onClick={handleViewRecords}
          disabled={loading || !isFilterSet}
        >
          {loading ? 'Loading...' : 'View Records'}
        </button>

        <button
          className="submit-button"
          style={{ backgroundColor: '#6c757d' }}
          onClick={resetFilters}
          disabled={loading || !isFilterSet}
        >
          Reset Filters
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!loading && records.length === 0 && isFilterSet && (
        <p style={{ marginTop: 20 }}>No records found.</p>
      )}

      {records.length > 0 && (
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Maintenance Type</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Maintenance Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id || record.id}>
                  <td>{record.assetName}</td>
                  <td>{record.maintenanceType}</td>
                  <td>{record.status}</td>
                  <td>{record.technician}</td>
                  <td>
                    {record.maintenanceDate
                      ? new Date(record.maintenanceDate).toLocaleDateString()
                      : '-'}
                  </td>
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
