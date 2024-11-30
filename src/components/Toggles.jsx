import { useState, useEffect, useRef } from 'react';
import '../styles/toggles.css';

function Toggles() {
  const [datasetMode, setDatasetMode] = useState('upload');
  const [queryMode, setQueryMode] = useState('simple');
  const [externalUrl, setExternalUrl] = useState('');
  const [filteredExamples, setFilteredExamples] = useState([]);
  const [exampleUrls] = useState([
    'https://dbpedia.org/sparql',
    'https://query.wikidata.org/sparql',
    'https://data.bnf.fr/sparql',
    'https://lod.openlinksw.com/sparql',
    'https://sparql.data.world/sparql',
    'https://opendata.euskadi.eus/sparql',
    'https://sparql.uniprot.org/sparql',
    'https://semantic.eea.europa.eu/sparql',
    'https://id.nlm.nih.gov/mesh/sparql',
    'https://linkeddata.uriburner.com/sparql',
    'https://data.cityofnewyork.us/resource/rvhx-8trz',
    'https://graphdb.sti2.at/sparql',
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  const toggleDataset = () => setDatasetMode(datasetMode === 'upload' ? 'external' : 'upload');
  const toggleQuery = () => setQueryMode(queryMode === 'simple' ? 'advanced' : 'simple');

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

  // TO DO: Send a basic sparql request to check if endpoint is valid
  const handleValidation = () => {
    if (!exampleUrls.includes(externalUrl)) {
      setFilteredExamples([]);
      setDropdownOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidation();
    }
  };

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      handleValidation();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, );

  return (
    <div className="toggles">
      <div className="toggle-section">
        <label>Dataset:</label>
        <button className="toggle-dataset-query" onClick={toggleDataset}>
          <span className="button-text">{datasetMode === 'upload' ? 'Upload' : 'External'}</span>
        </button>
        {datasetMode === 'upload' && <input type="file" className="upload-input" />}
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
          </div>
        )}
      </div>

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
  );
}

export default Toggles;
