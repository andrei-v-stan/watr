import { useNavigate } from 'react-router-dom';
import '../styles/footer.css';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

function callCookie() {
  fetch(`http://${HOST}:${PORT}/${API}/files/cookie`, {
    method: 'GET',
    credentials: 'include',
  }).then(response => response.json())
    .then(data => console.log('Cookie refreshed:', data));
}

setInterval(() => {
  callCookie();
}, 15 * 60 * 1000);

callCookie();

export default function Footer() {
  const navigate = useNavigate();
  
    return (
      <footer id="footer-section" className="app-footer">
        <button
          onClick={() => navigate('/files')}
        >
          Change Files
        </button>

          <h3>© 2024 Watr. All rights reserved</h3>

          <button
          onClick={() => navigate('/about')}
        >
          About Us
        </button>
      </footer>
    );
  }