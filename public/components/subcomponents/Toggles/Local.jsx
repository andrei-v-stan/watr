import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

TogglesLocalSection.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

function TogglesLocalSection({ onFileSelect }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const dropdownRef = useRef(null);
  const ulRef = useRef(null);

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
    setDropdownOpen((prev) => !prev);
  };

  const handleFileSelect = (file) => {
    onFileSelect(file);
    setSelectedFile(file);
    setDropdownOpen(false);
  };
  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSelectedFile(value);
    setFilteredFiles(uploadedFiles.filter((file) => file.toLowerCase().includes(value)));
    setDropdownOpen(true);
    if (ulRef.current && value.trim() !== '') {
      ulRef.current.style.width = 'fit-content';
    } else if (ulRef.current) {
      ulRef.current.style.width = 'auto';
    }
  };

  const handleClickOutside = (e) => {
    if (
      (ulRef.current && !ulRef.current.contains(e.target)) &&
      (dropdownRef.current && !dropdownRef.current.contains(e.target))
    ) {
      setDropdownOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id="toggles-local-section">
      <h2>Select a local dataset</h2>
      <div className="input-with-icon" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search for a file"
          onChange={handleFilterChange}
          onClick={toggleDropdown}
          value={selectedFile}
        />
        <img src="/assets/cloud-search.png" alt="Search Image" className="search-image" />
      </div>
      {dropdownOpen && (
        <ul ref={ulRef} className={filteredFiles.length > 5 ? "scrollable" : ""}>
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <li key={index} onClick={() => handleFileSelect(file)}>
                {file}
              </li>
            ))
          ) : (
            <li className="no-results" onClick={(e) => e.preventDefault()}>No files found</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default TogglesLocalSection;