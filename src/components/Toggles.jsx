import { useState } from 'react';
import { Upload, Local, External } from './subcomponents/Toggles/index'
import '../styles/toggles.css';

function Toggles() {
  const [mode, setMode] = useState('upload');

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <section id="toggles-section">
      <h2>Select a dataset: </h2>
      <div id="toggles-button-container">
        <button
          className={`toggles-toggle-button ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => handleModeChange('upload')}
        >
          Upload
        </button>
        <button
          className={`toggles-toggle-button ${mode === 'local' ? 'active' : ''}`}
          onClick={() => handleModeChange('local')}
        >
          Local
        </button>
        <button
          className={`toggles-toggle-button ${mode === 'external' ? 'active' : ''}`}
          onClick={() => handleModeChange('external')}
        >
          External
        </button>
      </div>

      {mode === 'upload' && <Upload  />}
      {mode === 'local' && <Local />}
      {mode === 'external' && <External />}
    </section>
  );
}

export default Toggles;
