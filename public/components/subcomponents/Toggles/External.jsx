import { useState, useRef } from 'react';

function ExternalSection() {
  const [externalUrl, setExternalUrl] = useState('');
  const [filteredExamples, setFilteredExamples] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  const exampleUrls = [
    "https://example.com/sparql",
    "https://anotherexample.com/sparql",
  ];

  const handleExternalUrlChange = (e) => {
    const value = e.target.value;
    setExternalUrl(value);
    setFilteredExamples(exampleUrls.filter((url) => url.toLowerCase().includes(value.toLowerCase())));
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && externalUrl.trim()) {
      // Call validation or any API here
      setFilteredExamples([]);
      setDropdownOpen(false);
    }
  };

  return (
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
  );
}

export default ExternalSection;
