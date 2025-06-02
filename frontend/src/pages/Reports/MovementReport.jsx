import React, { useState } from "react";
import axios from "axios";

const MovementReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [movementFrom, setMovementFrom] = useState("");
  const [movementTo, setMovementTo] = useState("");
  const [returnable, setReturnable] = useState("");
  const [format, setFormat] = useState("json");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

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
        responseType: format === "json" ? "json" : "blob", // handle file download as blob
      };

      const response = await axios.get(
        `http://localhost:5000/movements/report?${params.toString()}`,
        config
      );

      if (format === "json") {
        setData(response.data);
      } else {
        // For CSV or PDF: create a download link and trigger it
        const blob = new Blob([response.data], {
          type:
            format === "csv"
              ? "text/csv"
              : "application/pdf",
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
      setError(err.response?.data?.message || err.message || "Error fetching movement report");
    }
  };

  return (
    <div>
      <h2>Movement Report</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
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

        <button onClick={fetchMovements}>Get Report</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {format === "json" && data.length > 0 && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflowY: "auto",
              backgroundColor: "#f4f4f4",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default MovementReport;
