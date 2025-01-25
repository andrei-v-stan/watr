import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Toggles, Operations, /*Export,*/ Footer, Files, Results } from './components';
import './App.css'

function App() {

  const [currentStep, setCurrentStep] = useState('selectFile');
  const [selectedFile, setSelectedFile] = useState('');
  const [results, setResults] = useState([]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCurrentStep('selectOperation');
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Toggles onFileSelect={handleFileSelect} />
                  {currentStep === 'selectOperation' && <Operations selectedFile={selectedFile} results={results} setResults={setResults} />}
                  <Results results={results} setResults={setResults} />
                  {/*
                  <Export />
                  */}
                </>
              }
            />
            <Route path="/files" element={<Files />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;