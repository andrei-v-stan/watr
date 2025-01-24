/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

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
    setCurrentPage(page);
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
    } catch (error) {
      // console.error('Invalid URL:', error);
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

  return (
    <div className="operations-visualize-section">
      <h2>Visualize Data</h2>
      <p>
        Your selected file: <strong>{file}</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('subject')}>
              Subject
              {sortBy === 'subject' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </th>
            <th onClick={() => handleSort('predicate')}>
              Predicate
              {sortBy === 'predicate' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
            </th>
            <th onClick={() => handleSort('object')}>
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
        <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>
          First
        </button>
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
          Previous
        </button>
        <span>
          Showing {indexOfFirstTriple + 1} to {sortedTriples.length}
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={elementsPerPage}
          onChange={handleElementsPerPageChange}
        />
        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
          Next
        </button>
        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
          Last
        </button>
      </div>
    </div>
  );
}

export default OperationsVisualizeSection;