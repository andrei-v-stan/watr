import { useState } from 'react';
import { Visualize, Classify, Compare, MatchAlign } from './subcomponents/Operations/index'
import '../styles/operations.css';
import PropTypes from "prop-types";

Operations.propTypes = {
  selectedFile: PropTypes.string.isRequired,
};


function Operations({ selectedFile }) {
  const [mode, setMode] = useState('');

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="operations">
      <h2>Operations ({selectedFile})</h2>
      <div className="operations-button-container">
        <button
          className={`operations-toggle-button ${mode === 'visualize' ? 'active' : ''}`}
          onClick={() => handleModeChange('visualize')}
        >
          Visualize
        </button>
        <button
          className={`operations-toggle-button ${mode === 'classify' ? 'active' : ''}`}
          onClick={() => handleModeChange('classify')}
        >
          Classify
        </button>
        <button
          className={`operations-toggle-button ${mode === 'compare' ? 'active' : ''}`}
          onClick={() => handleModeChange('compare')}
        >
          Compare
        </button>
        <button
          className={`operations-toggle-button ${mode === 'match-align' ? 'active' : ''}`}
          onClick={() => handleModeChange('match-align')}
        >
          Match/Align
        </button>
      </div>

      {mode === 'visualize' && <Visualize file={selectedFile} />}
      {mode === 'classify' && <Classify file={selectedFile} />}
      {mode === 'compare' && <Compare file={selectedFile} />}
      {mode === 'match-align' && <MatchAlign file={selectedFile} />}
    </div>
  );
}

export default Operations;