import React, { useState } from "react";
import "./MovementReport.css";

const MovementReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [movementFrom, setMovementFrom] = useState("");
  const [movementTo, setMovementTo] = useState("");
  const [returnable, setReturnable] = useState("");
  const [format, setFormat] = useState("json");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const goBack = () => {
    window.history.back();
  };

  const fetchMovements = async () => {
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        fromDate,
        toDate,
        movementFrom,
        movementTo,
        returnable,
        format,
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: format === "json" ? "json" : "blob",
      };

      const response = await fetch(
        `http://localhost:5000/movements/report?${params.toString()}`,
        config
      );

      if (format === "json") {
        const jsonData = await response.json();
        setData(jsonData);
      } else {
        const blobData = await response.blob();
        const blob = new Blob([blobData], {
          type: format === "csv" ? "text/csv" : "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `movement_report.${format === "csv" ? "csv" : "pdf"}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err.message || "Error fetching movement report");
    }
  };

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
          fetchMovements();
        }}
      >
        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <label>
          Movement From:
          <input
            type="text"
            value={movementFrom}
            onChange={(e) => setMovementFrom(e.target.value)}
          />
        </label>

        <label>
          Movement To:
          <input
            type="text"
            value={movementTo}
            onChange={(e) => setMovementTo(e.target.value)}
          />
        </label>

        <label>
          Returnable:
          <select
            value={returnable}
            onChange={(e) => setReturnable(e.target.value)}
          >
            <option value="">--All--</option>
            <option value="true">Returnable</option>
            <option value="false">Non-returnable</option>
          </select>
        </label>

        <label>
          Format:
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <button className="submit-button" type="submit">
          Get Report
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {format === "json" && data.length > 0 && (
        <pre className="json-output">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};

export default MovementReport;
