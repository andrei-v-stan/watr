import { Visualize, Classify, Compare, MatchAlign } from './subcomponents/index';
import PropTypes from 'prop-types';
import '../styles/operations.css';

function Operations({ selectedFile, results, setResults }) {
  const handleAddResult = (resultType) => {
    let operationResult;

    switch (resultType) {
      case 'Visualize':
        operationResult = <Visualize file={selectedFile} />;
        break;
      case 'Classify':
        operationResult = <Classify file={selectedFile} />;
        break;
      case 'Compare':
        operationResult = <Compare file={selectedFile} />;
        break;
      case 'Match-Align':
        operationResult = <MatchAlign file={selectedFile} />;
        break;
      default:
        return;
    }

    setResults([...results, { id: Date.now(), type: resultType, file: selectedFile, component: operationResult }]);
  };

  return (
    <div id="operations-section">
      <h2>Operations ({selectedFile})</h2>
      <div id="operations-button-container">
        <button onClick={() => handleAddResult('Visualize')}>Visualize</button>
        <button onClick={() => handleAddResult('Classify')}>Classify</button>
        <button onClick={() => handleAddResult('Compare')}>Compare</button>
        <button onClick={() => handleAddResult('Match-Align')}>Match/Align</button>
      </div>
    </div>
  );
}

Operations.propTypes = {
  selectedFile: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
  setResults: PropTypes.func.isRequired,
};

export default Operations;