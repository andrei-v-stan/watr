import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { convertTriplesToHTML, convertTriplesToJSONLD, convertTriplesToCSV } from "/src/utils/convertResult.js"

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

OperationsVisualizeSection.propTypes = {
  file: PropTypes.string.isRequired,
};

function OperationsVisualizeSection({ file }) {
  const [triples, setTriples] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [elementsPerPage, setElementsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/triples?file=${file}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTriples(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [file]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleElementsPerPageChange = (event) => {
    const newElementsPerPage = parseInt(event.target.value);
    if (!isNaN(newElementsPerPage) && newElementsPerPage > 0) {
      setElementsPerPage(newElementsPerPage);
      setCurrentPage(1);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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

  const sortedTriples = triples.sort((a, b) => {
    if (sortBy === 'subject') {
      return sortOrder === 'asc' ? a.subject.localeCompare(b.subject) : b.subject.localeCompare(a.subject);
    } else if (sortBy === 'predicate') {
      return sortOrder === 'asc' ? a.predicate.localeCompare(b.predicate) : b.predicate.localeCompare(a.predicate);
    } else if (sortBy === 'object') {
      return sortOrder === 'asc' ? a.object.localeCompare(b.object) : b.object.localeCompare(a.object);
    }
    return 0;
  });

  const indexOfLastTriple = currentPage * elementsPerPage;
  const indexOfFirstTriple = indexOfLastTriple - elementsPerPage;
  const currentTriples = sortedTriples.slice(indexOfFirstTriple, indexOfLastTriple);

  const totalPages = Math.ceil(sortedTriples.length / elementsPerPage);


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
    <div className="operations-visualize-section">
      <div className="download-links">
        <a href="#" onClick={handleDownloadHTML}>Download as HTML</a> |{" "}
        <a href="#" onClick={handleDownloadJSONLD}>Download as JSON-LD</a> |{" "}
        <a href="#" onClick={handleDownloadCSV}>Download as CSV</a>
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('subject')}>
              {sortBy === 'subject' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              Subject 
              {sortBy === 'subject' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </th>
            <th onClick={() => handleSort('predicate')}>
              {sortBy === 'predicate' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              Predicate 
              {sortBy === 'predicate' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </th>
            <th onClick={() => handleSort('object')}>
              {sortBy === 'object' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              Object 
              {sortBy === 'object' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </th>
          </tr>
        </thead>
        <tbody>
        {currentTriples.map((triple, index) => (
          <tr key={index}>
            <td>
              {isValidUrl(triple.subject) ? (
                <a href={triple.subject} target="_blank" rel="noopener noreferrer">
                  {triple.subject.substring(triple.subject.lastIndexOf('/') + 1)}
                </a>
              ) : (
                triple.subject.substring(triple.subject.lastIndexOf('/') + 1)
              )}
            </td>
            <td>
              {isValidUrl(triple.predicate) ? (
                <a href={triple.predicate} target="_blank" rel="noopener noreferrer">
                  {triple.predicate.substring(triple.predicate.lastIndexOf('/') + 1)}
                </a>
              ) : (
                triple.predicate.substring(triple.predicate.lastIndexOf('/') + 1)
              )}
            </td>
            <td>
              {isValidUrl(triple.object) ? (
                <a href={triple.object} target="_blank" rel="noopener noreferrer">
                  {triple.object.substring(triple.object.lastIndexOf('/') + 1)}
                </a>
              ) : (
                triple.object.substring(triple.object.lastIndexOf('/') + 1)
              )}
            </td>
          </tr>
        ))}
      </tbody>
      </table>
      <div className="pagination">
        <img
          src="/src/assets/arrow2.png"
          alt="Arrow_First"
          className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(1)}
          style={{ transform: 'scaleX(-1)' }}
        />
        <img
          src="/src/assets/arrow.png"
          alt="Arrow_Previous"
          className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          style={{ transform: 'scaleX(-1)' }}
        />
        <div className="pagination-numbers">
          <span>
            Showing {indexOfFirstTriple + 1} to {sortedTriples.length}
          </span>
          <input
            type="number"
            min={1}
            max={sortedTriples.length}
            value={elementsPerPage}
            onChange={handleElementsPerPageChange}
          />
        </div>
        <img
        src="/src/assets/arrow.png"
        alt="Arrow_Next"
        className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        />
        <img
          src="/src/assets/arrow2.png"
          alt="Arrow_Last"
          className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(totalPages)}
        />
      </div>
    </div>
  );
}

export default OperationsVisualizeSection;