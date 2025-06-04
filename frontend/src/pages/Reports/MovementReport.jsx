import React, { useState } from "react";
import "./MovementReport.css";

const backendURL = "http://localhost:5000";

const MovementReport = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    movementFrom: "",
    movementTo: "",
    returnable: "",
  });

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  const token = localStorage.getItem("token");

  // Helper: check if any filter is set
  const isFilterSet = Object.values(filters).some((val) => val && val !== "");

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Validate date logic
  const validateDates = () => {
    if (filters.fromDate && filters.toDate && new Date(filters.fromDate) > new Date(filters.toDate)) {
      setError("'From Date' cannot be later than 'To Date'. Please correct the dates.");
      setRecords([]);
      return false;
    }
    return true;
  };

  // Fetch data to view records
  const fetchRecords = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);
    setRecords([]);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      // format=json means fetch json data for viewing
      params.append("format", "json");

      const res = await fetch(`${backendURL}/movements/report?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch report data");

      const json = await res.json();
      setRecords(json.data || []);
      if (!json.data || json.data.length === 0) setError("No records found for the selected filters.");
    } catch (err) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV or PDF
  const handleExport = async (format) => {
    if (!validateDates()) return;

    setExporting(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      params.append("format", format);
      params.append("download", "true");

      const res = await fetch(`${backendURL}/movements/report?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `movement_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Error exporting data");
    } finally {
      setExporting(false);
    }
  };

  // Reset filters and data
  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      movementFrom: "",
      movementTo: "",
      returnable: "",
    });
    setRecords([]);
    setError(null);
  };

  const goBack = () => window.history.back();

  return (
    <div className="movement-report-wrapper">
      <div className="header-with-back-button">
        <button className="back-button" onClick={goBack}>
          ← Back
        </button>
        <h2 className="edit-movement-title">Movement Report</h2>
      </div>

      <form
        className="edit-movement-form"
        onSubmit={(e) => {
          e.preventDefault();
          fetchRecords();
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
            placeholder="Location or department"
          />
        </label>

        <label>
          Movement To:
          <input
            type="text"
            name="movementTo"
            value={filters.movementTo}
            onChange={handleChange}
            placeholder="Location or department"
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

        <div style={{ marginTop: 15 }}>
          <button
            className="submit-button"
            type="submit"
            disabled={loading || exporting || !isFilterSet}
            style={{ marginRight: 10 }}
          >
            {loading ? "Loading..." : "View Records"}
          </button>

          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={loading || exporting || !isFilterSet}
            style={{ marginRight: 10 }}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>

          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={loading || exporting || !isFilterSet}
            style={{ marginRight: 10 }}
          >
            {exporting ? "Exporting..." : "Export PDF"}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={loading || exporting}
            className="reset-button"
          >
            Reset Filters
          </button>
        </div>
      </form>

      {error && (
        <p className="error-message" style={{ marginTop: 10, color: "red" }}>
          {error}
        </p>
      )}

      {records.length > 0 && (
        <>
          <div className="report-actions" style={{ marginTop: 20 }}>
            <p>
              Total Records: <strong>{records.length}</strong>
            </p>
          </div>

          <div className="table-wrapper" style={{ marginTop: 10 }}>
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
                  <tr key={idx}>
                    <td>{item.assetName}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.movementFrom}</td>
                    <td>{item.movementTo}</td>
                    <td>{item.movementType}</td>
                    <td>{item.dispatchedBy}</td>
                    <td>{item.receivedBy}</td>
                    <td>{item.date ? new Date(item.date).toLocaleString() : "N/A"}</td>
                    <td>{item.returnable ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MovementReport;
