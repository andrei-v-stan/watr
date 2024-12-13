import { useState, useEffect, useRef } from 'react';
import config from '../config/config.js'; 
import '../styles/toggles.css';

const PORT = config.portAPI;
const API = config.apiPath;

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  const formatETA = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

function Toggles() {

  const [datasetMode, setDatasetMode] = useState('upload');
  const [queryMode, setQueryMode] = useState('simple');
  const [externalUrl, setExternalUrl] = useState('');
  const [filteredExamples, setFilteredExamples] = useState([]);

  const [files, setFiles] = useState([]);
  const [uploadText, setUploadText] = useState("");
  const [etaText, setEtaText] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [exampleUrls] = useState([
    'https://dbpedia.org/sparql',
    'https://query.wikidata.org/sparql',
    'https://data.bnf.fr/sparql',
    'https://sparql.uniprot.org/sparql',
    'https://linkeddata.uriburner.com/sparql',
  ]);


  const toggleDataset = () => setDatasetMode(datasetMode === 'upload' ? 'external' : 'upload');

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const uploadFiles = () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadText("");
    setEtaText("");

    const uploadNextFile = (index) => {
      if (index >= files.length) {
        setUploading(false);
        setUploadStatus("success");
        setUploadText("✔ All files uploaded successfully!");
        setTimeout(resetUploadState, 3000);
        return;
      }

      const file = files[index];
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      const startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          const uploadedSize = formatSize(event.loaded);
          const totalFormatted = formatSize(event.total);
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = event.loaded / elapsedTime;
          const eta = (event.total - event.loaded) / speed;

          setUploadText(`Uploading... File: ${index + 1}/${files.length} | ${percentComplete.toFixed(2)}% (${uploadedSize} / ${totalFormatted})`);
          setEtaText(`ETA: ${formatETA(eta)} | Speed: ${formatSize(speed)}/s`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          uploadNextFile(index + 1);
        } else {
          setUploadStatus("error");
          setUploadText("✖ Error during upload.");
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setUploadStatus("error");
        setUploadText("✖ Error during upload.");
        setUploading(false);
      };

      xhr.open("POST", `http://localhost:${PORT}/${API}/files/upload`);
      xhr.withCredentials = true;
      xhr.send(formData);
    };

    uploadNextFile(0);
  };

  const resetUploadState = () => {
    setFiles([]);
    setUploadText("");
    setEtaText("");
    setUploadStatus(null);
    setUploading(false);
  };

  const toggleQuery = () => setQueryMode(queryMode === 'simple' ? 'advanced' : 'simple');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  const handleExternalUrlChange = (e) => {
    const value = e.target.value;
    setExternalUrl(value);
    setFilteredExamples(
      exampleUrls.filter((url) => url.toLowerCase().includes(value.toLowerCase()))
    );
    setDropdownOpen(true);
  };

  const handleSelectExampleUrl = (url) => {
    setExternalUrl(url);
    setFilteredExamples([]);
    setDropdownOpen(false);
  };

  const handleInputClick = () => {
    setDropdownOpen(true);
    setFilteredExamples(exampleUrls);
  };



  const handleValidation = async () => {
    const query = `
      ASK { ?s ?p ?o }
    `;

    try {
      const response = await fetch(externalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `query=${encodeURIComponent(query)}`,
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        if (
          contentType &&
          (contentType.includes('application/sparql-results+json') ||
           contentType.includes('application/sparql-results+xml') ||
           contentType.includes('text/html') || 
           contentType.includes('application/xml'))
        ) {
          console.log('Valid SPARQL endpoint!');
          setFilteredExamples([]);
          setDropdownOpen(false);
          return true;
        } else {
          console.log('Invalid SPARQL endpoint: Unexpected content type.');
        }
      } else {
        console.log(`Invalid SPARQL endpoint: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('Error validating SPARQL endpoint:', error);
    }

    setFilteredExamples([]);
    setDropdownOpen(false);
    alert('The provided URL is not a valid SPARQL endpoint.');
    setExternalUrl('');
    return false;
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && externalUrl.trim()) {
      handleValidation();
    }
    setFilteredExamples([]);
    setDropdownOpen(false);
  };

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setDropdownOpen(false);
      if (externalUrl.trim()) {
        handleValidation();
      }
    }
  };

  

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, );
  

  return (
    <section className="toggles">

      <label>Dataset:</label>
      <button className="toggle-dataset-query" onClick={toggleDataset}>
        <span className="button-text">{datasetMode === 'upload' ? 'Upload' : 'External'}</span>
      </button>

      {datasetMode === 'upload' && (
        <div className="upload-input-container">
            <h2>Upload Files</h2>
            <input type="file" multiple onChange={handleFileChange} className="file-input" />
            <div className="file-list">
                {files.map((file, index) => (
                <div key={index} className="file-item">
                    <span className="file-name" onClick={() => removeFile(file.name)}>
                    {file.name} ✖
                    </span>
                </div>
                ))}
            </div>
            <button
                onClick={uploadFiles}
                disabled={uploading}
                className={`upload-button ${
                uploadStatus === "success" ? "success" : uploadStatus === "error" ? "error" : ""
                }`}
            >
                {uploading ? <span className="spinner"></span> : uploadStatus === "success" ? "✔" : "Submit"}
            </button>
            {uploadText && <div className="upload-text">{uploadText}</div>}
            {etaText && <div className="eta-text">{etaText}</div>}
        </div>
      )}

      {datasetMode === 'external' && (
        <div className="external-input-container" ref={inputRef}>
          <input
            type="text"
            placeholder="Enter URL or choose from examples"
            value={externalUrl}
            onChange={handleExternalUrlChange}
            onClick={handleInputClick}
            onKeyDown={handleKeyPress}
            className="external-input"
          />
          {dropdownOpen && filteredExamples.length > 0 && (
            <ul className="example-url-list">
              {filteredExamples.map((url, index) => (
                <li key={index} onClick={() => handleSelectExampleUrl(url)}>
                  {url}
                </li>
              ))}
            </ul>
          )}
                <div className="toggle-section">
                  <label>Query:</label>
                  <button className="toggle-dataset-query" onClick={toggleQuery}>
                    <span className="button-text">{queryMode === 'simple' ? 'Simple' : 'Advanced'}</span>
                  </button>
                  {queryMode === 'simple' && (
                    <div className="simple-query">
                      <label>Filter:</label>
                      <select>
                        <option value="filter1">Filter 1</option>
                        <option value="filter2">Filter 2</option>
                        <option value="filter3">Filter 3</option>
                      </select>
                    </div>
                  )}
                  {queryMode === 'advanced' && (
                    <textarea
                      placeholder="Enter your SPARQL query here"
                      className="advanced-query"
                    ></textarea>
                  )}
                </div>

                <div className="submit-button-container">
                  <button id="submit-button">SUBMIT</button>
                </div>
        </div>
      )}

    </section>
  );
}

export default Toggles;












