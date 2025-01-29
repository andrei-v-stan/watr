import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Select from "react-select";

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

OperationsClassifySection.propTypes = {
  file: PropTypes.string.isRequired,
};

function OperationsClassifySection({ file }) {
  const [predicates, setPredicates] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [pairs, setPairs] = useState([{ predicate: null, attribute: null }]);
  const [subjects, setSubjects] = useState([]);
  const [operation, setOperation] = useState('Union'); // Union or Intersection
  const [currentPage, setCurrentPage] = useState(1);
  const [elementsPerPage, setElementsPerPage] = useState(10);

  useEffect(() => {
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

    fetchPredicates();
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
    newPairs[index].attribute = null; // Reset attribute when predicate changes
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

  const toggleOperation = () => {
    setOperation(prevOperation => (prevOperation === 'Union' ? 'Intersection' : 'Union'));
  };

  const handleClassify = async () => {
    try {
      const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ file, pairs, operation }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubjects(data);
      setCurrentPage(1); // Reset to first page after classification
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

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

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const extractLastPath = (url) => {
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const lastSubjectIndex = currentPage * elementsPerPage;
  const firstSubjectIndex = lastSubjectIndex - elementsPerPage;
  const currentSubjects = subjects.slice(firstSubjectIndex, lastSubjectIndex);

  const totalPages = Math.ceil(subjects.length / elementsPerPage);

  return (
    <div className="operations-classify-section">
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
            {index < pairs.length - 1 && (
              <div className="operator-container">
                <span className="clause-operator">{operation === 'Union' ? 'OR' : 'AND'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="add-button" onClick={addPair}>Add Pair</button>
        <button className="switch-button" onClick={toggleOperation}>
          ∩ Switch to {operation === 'Union' ? 'Intersection' : 'Union'} ∪
        </button>
        <button className="classify-button" onClick={handleClassify}>Classify</button>
      </div>
      <div className="results-container">
        <table>
          <thead>
            <tr>
              <th>Subjects</th>
            </tr>
          </thead>
          <tbody>
            {currentSubjects.map((subject, index) => (
              <tr key={index}>
                <td>
                  {isValidUrl(subject) ? (
                    <a href={subject} target="_blank" rel="noopener noreferrer">
                      {extractLastPath(subject)}
                    </a>
                  ) : (
                    subject
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
              Showing {firstSubjectIndex + 1} to {subjects.length}
            </span>
            <input
              type="number"
              min={1}
              max={subjects.length}
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
    </div>
  );
}

export default OperationsClassifySection;