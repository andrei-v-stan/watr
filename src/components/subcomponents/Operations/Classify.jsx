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
  const [selectedPredicate, setSelectedPredicate] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchPredicatesAndAttributes = async () => {
      try {
        const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/predicates-attributes?file=${file}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPredicates(data.predicates);
        setAttributes(data.attributes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPredicatesAndAttributes();
  }, [file]);

  const handleClassify = async () => {
    if (!selectedPredicate || !selectedAttribute) return;

    try {
      const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/classify?file=${file}&predicate=${selectedPredicate}&attribute=${selectedAttribute}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Classify Data</h2>
      <div className="dropdown-container">
        <Select
          options={predicates.map(predicate => ({ value: predicate, label: predicate }))}
          onChange={option => setSelectedPredicate(option.value)}
          placeholder="Select Predicate"
        />
        <Select
          options={attributes.map(attribute => ({ value: attribute, label: attribute }))}
          onChange={option => setSelectedAttribute(option.value)}
          placeholder="Select Attribute"
        />
        <button onClick={handleClassify}>Classify</button>
      </div>
      <div className="results-container">
        <h3>Subjects</h3>
        <ul>
          {subjects.map((subject, index) => (
            <li key={index}>{subject}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OperationsClassifySection;