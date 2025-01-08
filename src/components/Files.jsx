import { useState, useEffect } from "react";
import '../styles/files.css';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

function Files() {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();

      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/files/datasets`, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch session data");
        }
        const data = await response.json();

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(2000 - elapsedTime, 0);

        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setSessionData(data);
            setIsLoading(false);
            setIsFadingIn(true);
          }, 500);
        }, remainingTime);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewFile = (filename) => {
    window.open(`http://${HOST}:${PORT}/${API}/files/${filename}`, "_blank");
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
  };

  const handleDeleteFile = async (filename) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/files/${filename}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
        const data = await fetch(`http://${HOST}:${PORT}/${API}/files/datasets`, { credentials: 'include' });
        const updatedData = await data.json();
        setSessionData(updatedData);
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  const handleRenameFile = async (filename) => {
    const newFilename = prompt(`Enter a new name for ${filename}:`);
    if (newFilename) {
      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/files/${filename}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newFilename }),
        });
        if (!response.ok) {
          throw new Error('Failed to rename file');
        }
        const data = await fetch(`http://${HOST}:${PORT}/${API}/files/datasets`, { credentials: 'include' });
        const updatedData = await data.json();
        setSessionData(updatedData);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div id="dataset-files-container">
      <h2>
        Your Uploaded Files
      </h2>
      {error && <p className="error-message">{error}</p>}
      {isLoading ? (
        <div id="dataset-files-section" className={isFadingOut ? "fade-out" : ""}>
          <img src='/src/assets/dataset.gif' alt="Loading..." id="loader-dataset" />
        </div>
      ) : (
        <div id="dataset-files-section" className={isFadingIn ? "fade-in" : ""}>
          <div className="inline-container">
            <h3>Session ID:</h3>
            <p>{sessionData.uuid}</p>
          </div>
          <div className="inline-container">
            <h3>Last Interaction:</h3>
            <p>{sessionData.timestamp}</p>
          </div>
          <div className="inline-container-files">
            <h3>Files:</h3>
            <input
              type="text"
              placeholder="Search files..."
              value={filterText}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <ul>
            {sessionData.files.length > 0 ? (
              sessionData.files
                .filter((file) => file.toLowerCase().includes(filterText))
                .map((file, index) => (
                  <li key={index}>
                    <button onClick={() => handleDeleteFile(file)}>
                      <img src="/src/assets/trashbin-symbol.png" alt="Delete" />
                    </button>
                    <button onClick={() => handleRenameFile(file)}>
                      <img src="/src/assets/rename-symbol.png" alt="Rename" />
                    </button>
                    <button onClick={() => handleViewFile(file)}>
                      {file}
                    </button>
                  </li>
                ))
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Files;