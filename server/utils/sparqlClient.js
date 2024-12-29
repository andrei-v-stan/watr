import axios from 'axios';

/**
 * Executes a SPARQL query against the given endpoint.
 * @param {string} endpointUrl - The SPARQL endpoint URL (dataset).
 * @param {string} query - The SPARQL query string.
 * @returns {Promise<Object>} - The query results.
 * @throws {Error} - If the query execution fails.
 */
export async function executeQuery(endpointUrl, query) {
  try {
    const response = await axios.post(endpointUrl, {
      query: query,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Watr Project'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('SPARQL query execution failed: ' + error.message);
  }
}

/**
 * Executes a SPARQL query against the Wikidata endpoint.
 * @param {string} query - The SPARQL query string.
 * @returns {Promise<Object>} - The query results.
 */
export async function executeSPARQLQuery(query) {
  const endpointUrl = 'https://query.wikidata.org/sparql';
  executeQuery(endpointUrl, query);
}

/**
 * Executes a SPARQL query against the given endpoint.
 * @param {string} query - The SPARQL query string.
 * @param {string} endpoint - The SPARQL endpoint URL (dataset).
 * @returns {Promise<Object>} - The query results.
 */
export async function queryTriple(subject, predicate, object, dataset, page, limit) {
  if(!page){
    page = 0;
  }
  if(!limit){
    limit = 10;
  }

  const query = `
    SELECT DISTINCT * 
    WHERE {
      ${subject ? `<${subject}>` : '?s'} 
      ${predicate ? `<${predicate}>` : '?p'} 
      ${object ? `<${object}>` : '?o'} .
    } LIMIT ${limit} OFFSET ${page}
  `;
  return queryEntities(dataset, query);
};

export async function querySubjects(dataset, page, limit) {
  if(!page){
    page = 0;
  }
  if(!limit){
    limit = 10;
  }
  
  const query = `
    SELECT DISTINCT ?s WHERE {
      ?s ?p ?o .
    }
    LIMIT ${limit} OFFSET ${page}
  `;
  return queryEntities(dataset, query);
}

export async function queryPredicates(dataset, page, limit) {
  if(!page){
    page = 0;
  }
  if(!limit){
    limit = 10;
  }
  
  const query = `
    SELECT DISTINCT ?p WHERE {
      ?s ?p ?o .
    }
    LIMIT ${limit} OFFSET ${page}
  `;
  return queryEntities(dataset, query);
}

export async function queryObjects(dataset, page, limit) {
  if(!page){
    page = 0;
  }
  if(!limit){
    limit = 10;
  }
  
  const query = `
    SELECT DISTINCT ?o WHERE {
      ?s ?p ?o .
    }
    LIMIT ${limit} OFFSET ${page}
  `;
  return queryEntities(dataset, query);
}

async function queryEntities(dataset, query) {
  if (!dataset) {
    return res.status(400).json({ error: 'Dataset is required.' });
  }
  return executeQuery(dataset, query);
}