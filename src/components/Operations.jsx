import { useState } from 'react';
import { Visualize, Classify, Compare, MatchAlign } from './subcomponents/Operations/index'
import '../styles/operations.css';

function Operations() {
  const [mode, setMode] = useState('visualize');

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="operations">
      <h2>Operations</h2>
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

      {mode === 'visualize' && <Visualize />}
      {mode === 'classify' && <Classify />}
      {mode === 'compare' && <Compare />}
      {mode === 'match-align' && <MatchAlign />}
    </div>
  );
}

export default Operations;