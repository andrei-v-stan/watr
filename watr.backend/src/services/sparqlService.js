// services/sparqlService.js
import SparqlClient from 'sparql-http-client';

const SPARQL_ENDPOINT =process.env.SPARQL_ENDPOINT;

export const sparqlQuery = async (query) => {
    const client = new SparqlClient(SPARQL_ENDPOINT);
    return client.query(query).execute();
};


export const queryTriple = async (subject, predicate, object, dataset) => {
    const subjectPart = subject ? `<${subject}>` : '?s';
    const predicatePart = predicate ? `<${predicate}>` : '?p';
    const objectPart = object ? `<${object}>` : '?o';

    const query = `
        PREFIX d: <${dataset}>
        SELECT ?s ?p ?o
        WHERE {
            GRAPH d: {
                ${subjectPart} ${predicatePart} ${objectPart} .
            }
        }
        LIMIT 100
    `;

    return sparqlQuery(query);
};
