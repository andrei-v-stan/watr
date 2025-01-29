import '../styles/about.css';

export default function About() {


  return (
    <div id="about-section">
      <img src="/assets/logo_board.png" alt="Logo Board" className="logo-board" />
      <div className="content">
        <h2>About Watr</h2>
        <p>This is the information about Watr that will be revealed after 2 seconds.</p>
      </div>
    </div>
  );
}