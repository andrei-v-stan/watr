import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Toggles, Operations, Export, Footer, Files } from './components';
import './App.css'

function App() {
  
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
                  <Toggles />
                  {/*
                  <Operations />
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
