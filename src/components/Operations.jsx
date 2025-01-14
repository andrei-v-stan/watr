import { useState, useEffect, useRef } from "react";
import '../styles/operations.css';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

export default function Operations() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const downloadDropdownRef = useRef(null);

  const fetchFiles = () => {
    fetch(`http://${HOST}:${PORT}/${API}/files/datasets`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch uploaded files");
        }
        return response.json();
      })
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setUploadedFiles(data.files);
          setFilteredFiles(data.files);
        }
      })
      .catch((error) => console.error("Error fetching files:", error));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleDropdown = () => {
    fetchFiles();
    setDropdownOpen((prev) => !prev);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setDropdownOpen(false);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSelectedFile(value);
    setFilteredFiles(uploadedFiles.filter((file) => file.toLowerCase().includes(value)));
    setDropdownOpen(true);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
    if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target)) {
      setDownloadDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDownloadSelect = (format) => {
    console.log(`Downloading in ${format} format`);
    setDownloadDropdownOpen(false);
  };

  return (
    <div className="operations">
      <div className="op-external-input-container" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search for a file"
          className="op-external-input"
          onChange={handleFilterChange}
          onClick={toggleDropdown}
          value={selectedFile}
        />
        {dropdownOpen && filteredFiles.length > 0 && (
          <ul className="op-example-url-list">
            {filteredFiles.map((file, index) => (
              <li key={index} onClick={() => handleFileSelect(file)}>
                {file}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="button-container">
        <button>Visualize</button>
        <button>Classify</button>
        <button>Compare</button>
        <button>Match/Align</button>

        <div className="dropdown-container" ref={downloadDropdownRef}>
          <button onClick={() => setDownloadDropdownOpen((prev) => !prev)}>Download</button>
          {downloadDropdownOpen && (
            <ul className="dropdown-options">
              <li onClick={() => handleDownloadSelect("HTML")}>HTML</li>
              <li onClick={() => handleDownloadSelect("JSON")}>JSON</li>
              <li onClick={() => handleDownloadSelect("TSV")}>TSV</li>
              <li onClick={() => handleDownloadSelect("CSV")}>CSV</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
