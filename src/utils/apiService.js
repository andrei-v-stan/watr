import axios from 'axios';
import config from '../config/config.js'; 

export const querySPARQL = async (query) => {
    try {
      const apiUrl = `http://${config.hostAddr}:${config.portAPI}${config.apiPath}/sparql/query`;
      const response = await axios.post(apiUrl, { query });
      return response.data;
    } catch (error) {
      console.error('Error executing SPARQL query:', error);
      throw error;
    }
  };