import { Header, Toggles, Operations, Export, Footer } from './components';
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <Toggles />
        <Operations />
        <Export />
      </main>
      <Footer />
    </div>
  );
}

export default App
