import { useState, useEffect } from 'react';
import PropTypes from "prop-types";


const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

OperationsClassifySection.propTypes = {
  file: PropTypes.string.isRequired,
};

function OperationsClassifySection({ file }) {

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://${HOST}:${PORT}/${API}/sparql/triples?file=${file}`, {
            credentials: 'include',
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, [file]);


  

  return (
    <div>
      <h2>Classify Data</h2>
      
    </div>
  );
}

export default OperationsClassifySection;