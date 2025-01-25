import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createPortal } from 'react-dom';
import '../styles/results.css';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

const ItemType = 'RESULT';

function DraggableResult({ result, index, moveResult, deleteResult, setFullScreen }) {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveResult(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div ref={(node) => ref(drop(node))} className="result-window">
      <div className="result-bar">
        <span>
          <h3>{result.type}</h3>
          <h4><a href={`http://${HOST}:${PORT}/${API}/files/${result.file}`} target="_blank">{'['+ result.file +']'}</a></h4>
          <h4>{'{'+ new Date(result.id).toLocaleString() +'}'}</h4>
        </span>
        <div className="result-controls">
          <button onClick={toggleMinimize} title="Minimize">
            {isMinimized ? '+' : '−'}
          </button>
          <button onClick={() => setFullScreen(result)} title="Maximize">
            ☐
          </button>
          <button onClick={() => deleteResult(result.id)} title="Close">
            ✕
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className={`result-box ${result.type}`}>
          {result.component}
        </div>
      )}
    </div>
  );
}

DraggableResult.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  moveResult: PropTypes.func.isRequired,
  deleteResult: PropTypes.func.isRequired,
  setFullScreen: PropTypes.func.isRequired,
};

function FullScreenResult({ result, exitFullScreen }) {
  return createPortal(
    <div className="full-screen-result">
      <div className="full-screen-bar">
        <span>
          <h3>{result.type}</h3>
          <h4><a href={`http://${HOST}:${PORT}/${API}/files/${result.file}`} target="_blank">{'['+ result.file +']'}</a></h4>
          <h4>{'{'+ new Date(result.id).toLocaleString() +'}'}</h4>
        </span>

        <button onClick={exitFullScreen} title="Exit Full Screen" className={"full-screen-bar-button"}>
          ✕
        </button>
      </div>
      <div className="full-screen-content">
        {result.component}
      </div>
    </div>,
    document.getElementById('portal-root')
  );
}

FullScreenResult.propTypes = {
  result: PropTypes.object.isRequired,
  exitFullScreen: PropTypes.func.isRequired,
};

function Results({ results, setResults }) {
  const [fullScreenResult, setFullScreenResult] = useState(null);
  const rootElement = document.getElementById('root');

  useEffect(() => {
    if (fullScreenResult) {
      rootElement.style.display = 'none';
    } else {
      rootElement.style.display = 'block';
    }
  }, [fullScreenResult, rootElement.style]);

  const moveResult = (fromIndex, toIndex) => {
    const updatedResults = [...results];
    const [movedResult] = updatedResults.splice(fromIndex, 1);
    updatedResults.splice(toIndex, 0, movedResult);
    setResults(updatedResults);
  };

  const deleteResult = (id) => {
    setResults(results.filter((result) => result.id !== id));
  };

  const setFullScreen = (result) => {
    setFullScreenResult(result);
  };

  const exitFullScreen = () => {
    setFullScreenResult(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div id="results-section">
        <h2>Results ({results.length})</h2>
        {results.map((result, index) => (
          <DraggableResult
            key={result.id}
            result={result}
            index={index}
            moveResult={moveResult}
            deleteResult={deleteResult}
            setFullScreen={setFullScreen}
          />
        ))}
        {fullScreenResult && (
          <FullScreenResult result={fullScreenResult} exitFullScreen={exitFullScreen} />
        )}
      </div>
    </DndProvider>
  );
}

Results.propTypes = {
  results: PropTypes.array.isRequired,
  setResults: PropTypes.func.isRequired,
};

export default Results;