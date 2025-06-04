import React, { useState } from "react";
import "./MovementReport.css";

const MovementReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [movementFrom, setMovementFrom] = useState("");
  const [movementTo, setMovementTo] = useState("");
  const [returnable, setReturnable] = useState("");
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPreview = async () => {
    setError(null);
    try {
      const params = new URLSearchParams({
        fromDate,
        toDate,
        movementFrom,
        movementTo,
        returnable,
        download: false,
      });

      const response = await fetch(
        `http://localhost:5000/movements/report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const json = await response.json();
      setData(json.data || []);
      setCount(json.count || 0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        fromDate,
        toDate,
        movementFrom,
        movementTo,
        returnable,
        format,
        download: true,
      });

      const response = await fetch(
        `http://localhost:5000/movements/report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `movement_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  const goBack = () => window.history.back();

  return (
    <div className="movement-report-wrapper">
      <div className="header-with-back-button">
        <button className="back-button" onClick={goBack}>← Back</button>
        <h2 className="edit-movement-title">Movement Report</h2>
      </div>

      <form
        className="edit-movement-form"
        onSubmit={(e) => {
          e.preventDefault();
          fetchPreview();
        }}
      >
        <label>From Date:
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>

        <label>To Date:
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>

        <label>Movement From:
          <input type="text" value={movementFrom} onChange={(e) => setMovementFrom(e.target.value)} />
        </label>

        <label>Movement To:
          <input type="text" value={movementTo} onChange={(e) => setMovementTo(e.target.value)} />
        </label>

        <label>Returnable:
          <select value={returnable} onChange={(e) => setReturnable(e.target.value)}>
            <option value="">--All--</option>
            <option value="true">Returnable</option>
            <option value="false">Non-returnable</option>
          </select>
        </label>

        <button className="submit-button" type="submit">Get Report</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {count > 0 && (
        <>
          <div className="report-actions">
            <p>Total Records: <strong>{count}</strong></p>
            <button onClick={() => handleExport("csv")}>Export CSV</button>
            <button onClick={() => handleExport("pdf")}>Export PDF</button>
          </div>

          <div className="table-wrapper">
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
                {data.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.assetName}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.movementFrom}</td>
                    <td>{item.movementTo}</td>
                    <td>{item.movementType}</td>
                    <td>{item.dispatchedBy}</td>
                    <td>{item.receivedBy}</td>
                    <td>{item.date ? new Date(item.date).toLocaleString() : 'N/A'}</td>
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
