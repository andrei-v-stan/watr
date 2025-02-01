import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/redir.css';

const Redir = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code') || '404';
  const message = params.get('message') || 'Page Not Found';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div id="redirect-section">
        <h1>⚠️ Woops ⚠️</h1>
        <h2>How did we get here❓</h2>
        <h3>Error code</h3>
        <h4>{code}</h4>
        <h3>Error message</h3>
        <h4>{message}</h4>
        <h5>Redirecting to the main page in 10 seconds...</h5>
    </div>
  );
};

export default Redir;
