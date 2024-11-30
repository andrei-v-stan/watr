import { Header, Toggles, Results, Operations, Export, Footer } from './components';
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <Toggles />
        <Results />
        <Operations />
        <Export />
      </main>
      <Footer />
    </div>
  );
}

export default App
