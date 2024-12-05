import React, { useState, useEffect } from "react";

const Files = () => {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch session details
    fetch("http://localhost:4000/api/files/session", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch session data");
        }
        return response.json();
      })
      .then((data) => setSessionData(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleViewFile = (filename) => {
    window.open(`http://localhost:4000/api/files/file/${filename}`, "_blank");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Your Uploaded Files</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {sessionData ? (
        <div>
          <p><strong>Session ID:</strong> {sessionData.sessionId}</p>
          <p><strong>Last Interaction:</strong> {sessionData.timestamp}</p>
          <h3>Files:</h3>
          <ul>
            {sessionData.files.length > 0 ? (
              sessionData.files.map((file, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleViewFile(file)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "blue",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    {file}
                  </button>
                </li>
              ))
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </ul>
        </div>
      ) : (
        <p>Loading session data...</p>
      )}
    </div>
  );
};

export default Files;
