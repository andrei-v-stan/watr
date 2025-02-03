import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { convertTriplesToHTML, convertTriplesToJSONLD, convertTriplesToCSV } from "/src/utils/convertResult.js"

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

OperationsCompareSection.propTypes = {
  file: PropTypes.string.isRequired,
};

function OperationsCompareSection({ file }) {
  const [triples, setTriples] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedPredicates, setSelectedPredicates] = useState([]);
  const [viewMode, setViewMode] = useState("subjects");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/triples?file=${file}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTriples(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [file]);

  const handleViewModeToggle = () => {
    setViewMode(viewMode === "subjects" ? "predicates" : "subjects");
    setSelectedSubjects([]);
    setSelectedPredicates([]);
  };

  const handleSubjectSelect = (selectedOptions) => {
    setSelectedSubjects(selectedOptions.map((option) => option.value));
  };

  const handlePredicateSelect = (selectedOptions) => {
    setSelectedPredicates(selectedOptions.map((option) => option.value));
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

  const getFilteredTriples = () => {
    if (viewMode === "subjects") {
      return triples.filter((triple) => selectedSubjects.includes(triple.subject));
    } else {
      return triples.filter((triple) => selectedPredicates.includes(triple.predicate));
    }
  };

  const filteredTriples = getFilteredTriples();

  const extractLastPath = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const uniqueSubjects = [
    ...new Set(triples.map((triple) => triple.subject)),
  ].map((subject) => ({
    value: subject,
    label: extractLastPath(subject),
  }));

  const uniquePredicates = [
    ...new Set(triples.map((triple) => triple.predicate)),
  ].map((predicate) => ({
    value: predicate,
    label: extractLastPath(predicate),
  }));

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
    const htmlContent = await convertTriplesToHTML(triples);
    downloadFile(htmlContent, "text/html", "result.html");
  };

  const handleDownloadJSONLD = async () => {
    const jsonLDContent = await convertTriplesToJSONLD(triples);
    downloadFile(jsonLDContent, "application/json", "result.jsonld");
  };

  const handleDownloadCSV = async () => {
    const csvContent = await convertTriplesToCSV(triples);
    downloadFile(csvContent, "text/csv", "result.csv");
  };

  return (
    <div className="operations-compare-section">
      <div className="download-links">
        <a href="#" onClick={handleDownloadHTML}>Download as HTML</a> |{" "}
        <a href="#" onClick={handleDownloadJSONLD}>Download as JSON-LD</a> |{" "}
        <a href="#" onClick={handleDownloadCSV}>Download as CSV</a>
      </div>
      <button onClick={handleViewModeToggle}>
        Compare mode: {viewMode === "subjects" ? "Subjects" : "Predicates"}
      </button>
      <div className="dropdown-container">
        {viewMode === "subjects" ? (
          <Select
            isMulti
            options={uniqueSubjects}
            onChange={handleSubjectSelect}
            placeholder="Select Subjects"
            value={selectedSubjects.map((subject) => ({
              value: subject,
              label: extractLastPath(subject),
            }))}
          />
        ) : (
          <Select
            isMulti
            options={uniquePredicates}
            onChange={handlePredicateSelect}
            placeholder="Select Predicates"
            value={selectedPredicates.map((predicate) => ({
              value: predicate,
              label: extractLastPath(predicate),
            }))}
          />
        )}
      </div>
      <div className="operations-table-container">
        <table>
          <thead>
            <tr>
              <th>{viewMode === "subjects" ? "Predicate" : "Subject"}</th>
              {viewMode === "subjects" &&
                selectedSubjects.map((subject, index) => (
                  <th key={index}>
                    {isValidUrl(subject) ? (
                      <a href={subject} target="_blank" rel="noopener noreferrer">
                        {extractLastPath(subject)}
                      </a>
                    ) : (
                      extractLastPath(subject)
                    )}
                  </th>
                ))}
              {viewMode === "predicates" &&
                selectedPredicates.map((predicate, index) => (
                  <th key={index}>
                    {isValidUrl(predicate) ? (
                      <a href={predicate} target="_blank" rel="noopener noreferrer">
                        {extractLastPath(predicate)}
                      </a>
                    ) : (
                      extractLastPath(predicate)
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {viewMode === "subjects" ? (
              [...new Set(filteredTriples.map((triple) => triple.predicate))].map(
                (predicate, index) => (
                  <tr key={index}>
                    <td>
                      {isValidUrl(predicate) ? (
                        <a href={predicate} target="_blank" rel="noopener noreferrer">
                          {extractLastPath(predicate)}
                        </a>
                      ) : (
                        extractLastPath(predicate)
                      )}
                    </td>
                    {selectedSubjects.map((subject, index) => {
                      const triple = filteredTriples.find(
                        (t) => t.predicate === predicate && t.subject === subject
                      );
                      return (
                        <td key={index}>
                          {triple ? (
                            isValidUrl(triple.object) ? (
                              <a href={triple.object} target="_blank" rel="noopener noreferrer">
                                {extractLastPath(triple.object)}
                              </a>
                            ) : (
                              extractLastPath(triple.object)
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )
              )
            ) : (
              [...new Set(filteredTriples.map((triple) => triple.subject))].map(
                (subject, index) => (
                  <tr key={index}>
                    <td>
                      {isValidUrl(subject) ? (
                        <a href={subject} target="_blank" rel="noopener noreferrer">
                          {extractLastPath(subject)}
                        </a>
                      ) : (
                        extractLastPath(subject)
                      )}
                    </td>
                    {selectedPredicates.map((predicate, index) => {
                      const triple = filteredTriples.find(
                        (t) => t.subject === subject && t.predicate === predicate
                      );
                      return (
                        <td key={index}>
                          {triple ? (
                            isValidUrl(triple.object) ? (
                              <a href={triple.object} target="_blank" rel="noopener noreferrer">
                                {extractLastPath(triple.object)}
                              </a>
                            ) : (
                              extractLastPath(triple.object)
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OperationsCompareSection;
