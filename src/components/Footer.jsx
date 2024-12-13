import '../styles/footer.css';
import config from '../config/config.js'; 

const PORT = config.portAPI;
const API = config.apiPath;

function callCookie() {
  fetch(`http://localhost:${PORT}/${API}/files/cookie`, {
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
  
    return (
      <footer className="app-footer">
        <p>© 2024 Watr. All rights reserved.</p>
      </footer>
    );
  }