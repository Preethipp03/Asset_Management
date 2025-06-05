import React, { useState } from 'react';
import axios from 'axios';
import './MaintenanceReport.css'; // Assuming this CSS provides styling for the layout and table

const backendURL = 'http://localhost:5000'; // Ensure this matches your backend server's address

const MovementReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    movementFrom: '',
    movementTo: '',
    returnable: '',
    format: 'csv', // Default export format
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // New state to track if a search has been attempted

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Checks if any filter field has a value
  const isFilterSet =
    filters.fromDate ||
    filters.toDate ||
    filters.movementFrom ||
    filters.movementTo ||
    filters.returnable;

  const handleViewRecords = async () => {
    setLoading(true);
    setError(null);
    setRecords([]); // Clear previous records
    setHasSearched(true); // Mark that a search has been performed

    try {
      const token = localStorage.getItem('token'); // Retrieve auth token
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Prepare parameters for the GET request
      const params = { ...filters };
      delete params.format; // The backend shouldn't need the export format for viewing records

      // Remove empty filter values to avoid sending unnecessary query parameters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      console.log('Sending view records request with params:', params); // Debugging line
      console.log('Authorization token:', token); // Debugging line

      const response = await axios.get(`${backendURL}/movements/report`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Backend response data:', response.data); // Debugging line: Crucial to see what the backend returns

      // Ensure response.data is an array. If your backend nests it, adjust this line.
      if (Array.isArray(response.data)) {
        setRecords(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Example if backend returns { success: true, data: [...] }
        setRecords(response.data.data);
      } else {
        console.warn('Backend did not return an array of records directly:', response.data);
        setError('Unexpected data format from server. Check console for details.');
        setRecords([]); // Ensure records are empty if format is unexpected
      }

    } catch (err) {
      console.error('Error fetching movement records:', err); // Log the full error
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || `Error: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Check if backend is running and accessible.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Include 'download' parameter for backend to know it's an export request
      const params = { ...filters, download: 'true' };

      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      console.log('Sending export request with params:', params); // Debugging line

      const response = await axios.get(`${backendURL}/movements/report`, {
        params,
        responseType: 'blob', // Important for file downloads (CSV, PDF)
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([response.data], {
        type: filters.format === 'pdf' ? 'application/pdf' : 'text/csv',
      });

      // Create a temporary link element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `movement_report.${filters.format}`; // Set file name
      document.body.appendChild(link);
      link.click(); // Programmatically click the link to start download
      link.remove(); // Clean up the temporary link
      window.URL.revokeObjectURL(url); // Release the object URL

    } catch (err) {
      console.error('Error exporting movement report:', err); // Log the full error
      if (err.response) {
        setError(err.response.data?.message || `Export Error: ${err.response.status} ${err.response.statusText}`);
      } else {
        setError(`Export request error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      movementFrom: '',
      movementTo: '',
      returnable: '',
      format: 'csv',
    });
    setRecords([]); // Clear records when resetting filters
    setError(null);
    setHasSearched(false); // Reset search status
  };

  const handleBack = () => {
    window.history.back(); // Navigates back in browser history
  };

  return (
    <div className="maintenance-report-wrapper">
      <header className="header-with-back-button">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h1 className="edit-movement-title">Movement Report</h1>
      </header>

      <form className="edit-movement-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          From Date:
          <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} />
        </label>

        <label>
          To Date:
          <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} />
        </label>

        <label>
          Movement From:
          <input
            type="text"
            name="movementFrom"
            value={filters.movementFrom}
            onChange={handleChange}
            placeholder="From Location"
          />
        </label>

        <label>
          Movement To:
          <input
            type="text"
            name="movementTo"
            value={filters.movementTo}
            onChange={handleChange}
            placeholder="To Location"
          />
        </label>

        <label>
          Returnable:
          <select name="returnable" value={filters.returnable} onChange={handleChange}>
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>
          Export Format:
          <select name="format" value={filters.format} onChange={handleChange}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
      </form>

      <div className="button-group">
        <button className="submit-button" onClick={handleExport} disabled={loading || !isFilterSet}>
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
          // Reset button should always be enabled, even if filters aren't set yet
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Conditional rendering for messages */}
      {!loading && hasSearched && records.length === 0 && !error && (
        <p style={{ marginTop: 20 }}>No records found for the applied filters.</p>
      )}

      {loading && <p style={{ marginTop: 20 }}>Loading records...</p>}

      {records.length > 0 && (
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Movement From</th>
                <th>Movement To</th>
                <th>Returnable</th>
                <th>Movement Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id || record.id}> {/* Use unique key for each row */}
                  <td>{record.assetName}</td>
                  <td>{record.movementFrom}</td>
                  <td>{record.movementTo}</td>
                  <td>{record.returnable ? 'Yes' : 'No'}</td>
                  <td>{record.movementDate ? new Date(record.movementDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MovementReport;