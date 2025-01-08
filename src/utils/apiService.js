import axios from 'axios';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

export const querySPARQL = async (query) => {
    try {
      const apiUrl = `http://${HOST}:${PORT}${API}/sparql/query`;
      const response = await axios.post(apiUrl, { query });
      return response.data;
    } catch (error) {
      console.error('Error executing SPARQL query:', error);
      throw error;
    }
  };