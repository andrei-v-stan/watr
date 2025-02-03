import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { convertTriplesToHTML, convertTriplesToJSONLD, convertTriplesToCSV } from "/src/utils/convertResult.js"

OperationsMatchAlignSection.propTypes = {
  file: PropTypes.func.isRequired,
  onComparedFileSelect: PropTypes.func.isRequired,
};

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

function OperationsMatchAlignSection({ file }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [matchingFiledropdownOpen, setMatchingFileDropdownOpen] = useState(false);
  const [matchingFilteredFiles, setMatchingFilteredFiles] = useState([]);
  const [otherFile, setMatchingSelectedFile] = useState("");
  const [predicates, setPredicates] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [pairs, setPairs] = useState([{ predicate: null, attribute: null }]);
  const [matchedSubjects, setMatchedSubjects] = useState([]);
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
          data.files = data.files.filter((f) => f !== file);
          setUploadedFiles(data.files);
          setMatchingFilteredFiles(data.files);
        }
      })
      .catch((error) => console.error("Error fetching files:", error));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchPredicates = async () => {
    try {
      const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/predicates?file=${file}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredicates(data.map(predicate => ({ value: predicate, label: predicate })));
    } catch (error) {
      console.error('Error fetching predicates:', error);
    }
  };

  useEffect(() => {
    if (file) {
      fetchPredicates();
    }
  }, [file]);

  const fetchAttributes = async (predicate, index) => {
    try {
      const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/attributes?file=${file}&predicate=${predicate}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAttributes = data.map(attribute => ({ value: attribute, label: attribute }));
      setAttributes(prevAttributes => {
        const updatedAttributes = [...prevAttributes];
        updatedAttributes[index] = newAttributes;
        return updatedAttributes;
      });
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const handlePredicateChange = (selectedOption, index) => {
    const newPairs = [...pairs];
    newPairs[index].predicate = selectedOption.value;
    newPairs[index].attribute = null;
    setPairs(newPairs);
    fetchAttributes(selectedOption.value, index);
  };

  const handleAttributeChange = (selectedOption, index) => {
    const newPairs = [...pairs];
    newPairs[index].attribute = selectedOption.value;
    setPairs(newPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { predicate: null, attribute: null }]);
  };

  const deletePair = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
  };

  const handleFileSelect = (file) => {
    setMatchingSelectedFile(file);
    setMatchingFileDropdownOpen(false);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setMatchingSelectedFile(value);
    setMatchingFilteredFiles(uploadedFiles.filter((file) => file.toLowerCase().includes(value)));
    setMatchingFileDropdownOpen(true);
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
      setMatchingFileDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMatch = async () => {
    try {
      const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ file, otherFile, pairs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatchedSubjects(data);
    } catch (error) {
      console.error('Error fetching matched subjects:', error);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return false;
    }
  };

  const createTriplets = () => {
    return pairs.map(pair => ({
        subject: pair.attribute,
        predicate: pair.predicate,
        object: pair.attribute
    }));
};

  const downloadFile = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = async () => {
    const triples = createTriplets();
    const htmlContent = await convertTriplesToHTML(triples);
    downloadFile(htmlContent, "text/html", "result.html");
  };

  const handleDownloadJSONLD = async () => {
    const triples = createTriplets();
    const jsonLDContent = await convertTriplesToJSONLD(triples);
    downloadFile(jsonLDContent, "application/json", "result.jsonld");
  };

  const handleDownloadCSV = async () => {
    const triples = createTriplets();
    const csvContent = await convertTriplesToCSV(triples);
    downloadFile(csvContent, "text/csv", "result.csv");
  };

  return (
    <div className="operations-match-align-section">
      <div className="download-links">
        <a href="#" onClick={handleDownloadHTML}>Download as HTML</a> |{" "}
        <a href="#" onClick={handleDownloadJSONLD}>Download as JSON-LD</a> |{" "}
        <a href="#" onClick={handleDownloadCSV}>Download as CSV</a>
      </div>
      <div id="toggles-local-section">
        <h2>Match with:</h2>
        <div className="input-with-icon" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search for a file"
            onChange={handleFilterChange}
            onClick={() => setMatchingFileDropdownOpen(true)}
            value={otherFile}
          />
          <img src="/src/assets/cloud-search.png" alt="Search Image" className="search-image" />
        </div>
        {matchingFiledropdownOpen && (
          <ul ref={ulRef} className={matchingFilteredFiles.length > 5 ? "scrollable" : ""}>
            {matchingFilteredFiles.length > 0 ? (
              matchingFilteredFiles.map((file, index) => (
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
      <div className="dropdown-containers">
        {pairs.map((pair, index) => (
          <div key={index} className="pair-wrapper">
            <div className="pair-container">
              <div className="dropdown-container">
                <Select
                  options={predicates}
                  onChange={option => handlePredicateChange(option, index)}
                  placeholder="Select Predicate"
                  value={predicates.find(p => p.value === pair.predicate)}
                />
              </div>
              {pair.predicate && (
                <div className="dropdown-container">
                  <Select
                    options={attributes[index] || []}
                    onChange={option => handleAttributeChange(option, index)}
                    placeholder="Select Attribute"
                    value={attributes[index]?.find(a => a.value === pair.attribute)}
                  />
                </div>
              )}
              <button className="delete-button" onClick={() => deletePair(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="add-button" onClick={addPair}>Add Pair</button>
        <button className="match-button" onClick={handleMatch}>Match</button>
      </div>
      <div className="results-container">
        <table>
          <thead>
            <tr>
              <th>{file}</th>
              <th>{otherFile}</th>
            </tr>
          </thead>
          <tbody>
            {matchedSubjects.map((subject, index) => (
              <tr key={index}>
                <td>
                  <details>
                    <summary>
                      {isValidUrl(subject.file.subject) ? (
                        <a href={subject.file.subject} target="_blank" rel="noopener noreferrer">
                          {subject.file.subject}
                        </a>
                      ) : (
                        subject.file.subject
                      )}
                    </summary>
                    <ul>
                      {subject.file.details.map((detail, idx) => (
                        <li key={idx}>
                          {detail.predicate} <span>&#8594;</span> {detail.object}
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
                <td>
                  <details>
                    <summary>
                      {isValidUrl(subject.otherFile.subject) ? (
                        <a href={subject.otherFile.subject} target="_blank" rel="noopener noreferrer">
                          {subject.otherFile.subject}
                        </a>
                      ) : (
                        subject.otherFile.subject
                      )}
                    </summary>
                    <ul>
                      {subject.otherFile.details.map((detail, idx) => (
                        <li key={idx}>
                          {detail.predicate} <span>&#8594;</span> {detail.object}
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OperationsMatchAlignSection;