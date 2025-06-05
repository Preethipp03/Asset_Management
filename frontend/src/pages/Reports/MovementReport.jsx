import React, { useState } from "react";
import "./MovementReport.css";

const backendURL = "http://localhost:5000";

const MovementReport = () => {
  // State hooks for managing filters, loading status, errors, and fetched records.
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    movementFrom: "",
    movementTo: "",
    returnable: "", // Can be 'true', 'false', or empty for 'All'
  });

  const [loading, setLoading] = useState(false); // Indicates if records are being fetched
  const [exporting, setExporting] = useState(false); // Indicates if an export operation is in progress
  const [error, setError] = useState(null); // Stores any error messages
  const [records, setRecords] = useState([]); // Stores the fetched movement records

  // Retrieve authentication token from local storage.
  const token = localStorage.getItem("token");

  // Determines if any filter criteria have been set by the user.
  const isFilterSet = Object.values(filters).some((val) => val !== "");

  // Handles changes to input fields and select elements, updating the filters state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Validates that the 'From Date' is not later than the 'To Date'.
  const validateDates = () => {
    if (filters.fromDate && filters.toDate && new Date(filters.fromDate) > new Date(filters.toDate)) {
      setError("'From Date' cannot be later than 'To Date'");
      setRecords([]); // Clear records if dates are invalid
      return false;
    }
    setError(null); // Clear previous date validation error if dates are now valid
    return true;
  };

  // Fetches movement records from the backend based on current filters.
  const fetchRecords = async () => {
    if (!validateDates()) return; // Stop if dates are invalid

    setLoading(true);
    setError(null);
    setRecords([]);

    try {
      const params = new URLSearchParams();
      // Append only non-empty filter values to URL parameters.
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      params.append("format", "json"); // Request JSON format for viewing records

      const res = await fetch(`${backendURL}/movements/report?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include authorization token
      });

      // Handle non-OK HTTP responses
      if (!res.ok) {
        const errorData = await res.json(); // Attempt to parse error message from response body
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const json = await res.json();
      setRecords(json.data || []); // Update records state

      // Set 'No records found' error if no data is returned
      if (!json.data || json.data.length === 0) {
        setError("No records found.");
      }
    } catch (err) {
      setError(err.message || "Error fetching data"); // Set error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Handles exporting movement records to CSV or PDF format.
  const handleExport = async (format) => {
    if (!validateDates()) return; // Stop if dates are invalid

    setExporting(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      // Append all filter parameters to the URL.
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      params.append("format", format); // Specify export format (csv or pdf)
      params.append("download", "true"); // Indicate that the request is for download

      const res = await fetch(`${backendURL}/movements/report?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include authorization token
        },
      });

      // Handle non-OK HTTP responses
      if (!res.ok) {
        const errorText = await res.text(); // Get raw error message for blob responses
        throw new Error(errorText || "Export failed");
      }

      const blob = await res.blob(); // Get the response as a Blob
      const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
      const link = document.createElement("a"); // Create a temporary anchor element
      link.href = url;
      link.setAttribute("download", `movement_report.${format}`); // Set download filename
      document.body.appendChild(link); // Append link to body
      link.click(); // Programmatically click the link to trigger download
      link.remove(); // Remove the temporary link
      window.URL.revokeObjectURL(url); // Release the object URL
    } catch (err) {
      setError(err.message || "Export error"); // Set error message
    } finally {
      setExporting(false); // Reset exporting state
    }
  };

  // Resets all filters and clears fetched records and errors.
  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      movementFrom: "",
      movementTo: "",
      returnable: "",
    });
    setRecords([]); // Clear displayed records
    setError(null); // Clear any errors
  };

  // Navigates back in the browser history.
  const goBack = () => window.history.back();

  return (
    <div className="movement-report-wrapper">
      {/* Header section with back button and title */}
      <div className="header-with-back-button">
        <button className="back-button" onClick={goBack}>
          ← Back
        </button>
        <h2 className="edit-movement-title">Movement Report</h2>
      </div>

      {/* Form section for applying filters */}
      <form
        className="edit-movement-form"
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          fetchRecords(); // Fetch records on form submit
        }}
      >
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
            placeholder="Location or Department"
          />
        </label>

        <label>
          Movement To:
          <input
            type="text"
            name="movementTo"
            value={filters.movementTo}
            onChange={handleChange}
            placeholder="Location or Department"
          />
        </label>

        <label>
          Returnable:
          <select name="returnable" value={filters.returnable} onChange={handleChange}>
            <option value="">--All--</option>
            <option value="true">Returnable</option>
            <option value="false">Non-returnable</option>
          </select>
        </label>

        {/* Button group for actions: View, Export, Reset */}
        <div className="button-group">
          <button
            className="submit-button"
            type="submit" // This button triggers the form's onSubmit (fetchRecords)
            disabled={loading || exporting || !isFilterSet}
          >
            {loading ? "Loading..." : "View Records"}
          </button>

          <button
            type="button" // Important: not 'submit' to prevent form re-submission
            onClick={() => handleExport("csv")}
            className="submit-button"
            disabled={loading || exporting || !isFilterSet}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>

          <button
            type="button"
            onClick={() => handleExport("pdf")}
            className="submit-button"
            disabled={loading || exporting || !isFilterSet}
          >
            {exporting ? "Exporting..." : "Export PDF"}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="submit-button"
            disabled={loading || exporting}
          >
            Reset Filters
          </button>
        </div>
      </form>

      {/* Display error messages */}
      {error && <p className="error-message">{error}</p>}

      {/* Message when no records are found after filtering */}
      {!loading && records.length === 0 && isFilterSet && !error && (
        <p>No records found.</p> // Removed inline style as CSS handles 'p' tag margin
      )}

      {/* Display records in a table if no error and records exist */}
      {!error && records.length > 0 && (
        <div className="table-container">
          <p>
            <strong>Total Records:</strong> {records.length}
          </p>
          <table className="report-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Serial No</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Dispatched By</th>
                <th>Received By</th>
                <th>Date</th>
                <th>Returnable</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item, idx) => (
                <tr key={item._id || idx}> {/* Use _id if available, otherwise idx */}
                  <td>{item.assetName}</td>
                  <td>{item.serialNumber}</td>
                  <td>{item.movementFrom}</td>
                  <td>{item.movementTo}</td>
                  <td>{item.movementType}</td>
                  <td>{item.dispatchedBy}</td>
                  <td>{item.receivedBy}</td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</td>
                  <td>{item.returnable ? "Yes" : "No"}</td>
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
