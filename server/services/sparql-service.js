import axios from 'axios';
import N3Parser from '@rdfjs/parser-n3';
import { createReadStream } from 'fs';
import streamToArray from 'stream-to-array';

export async function parseAndOrganizeDataset(filePath) {
  const parser = new N3Parser();
  const rdfStream = createReadStream(filePath);
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);
  const triples = [];

  quads.forEach((quad) => {
    triples.push({
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: quad.object.value,
    });
  });

  return triples;
}

export async function getDistinctPredicates(filePath) {
  const parser = new N3Parser();
  const rdfStream = createReadStream(filePath);
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);
  const predicates = new Set();

  quads.forEach((quad) => {
    predicates.add(quad.predicate.value);
  });

  return Array.from(predicates);
}

export async function getDistinctAttributes(filePath, predicate) {
  const parser = new N3Parser();
  const rdfStream = createReadStream(filePath);
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);
  const attributes = new Set();

  quads.forEach((quad) => {
    if (quad.predicate.value === predicate) {
      attributes.add(quad.object.value);
    }
  });

  return Array.from(attributes);
}

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
  return await executeQuery(endpointUrl, query);
}

/**
 * Executes a SPARQL query against the given endpoint.
 * @param {string} query - The SPARQL query string.
 * @param {string} endpoint - The SPARQL endpoint URL (dataset).
 * @returns {Promise<Object>} - The query results.
 */
export async function queryTriple(subjects, predicates, objects, dataset, page, limit) {
  /*
    Body example:
    {
      "subject": null,
      "predicate": ["wdt:P31"],
      "object": ["wd:Q146"],
      "dataset": "https://query.wikidata.org/sparql"
    }
  */

  if(!page){
    page = 0;
  }
  if(!limit){
    limit = 10;
  }

  const subjectCondition = subjects ? `FILTER (?subject IN (${subjects.map(s => `${s}`).join(', ')}))` : '';
  const predicateCondition = predicates ? `FILTER(?predicate IN (${predicates.map(p => `${p}`).join(', ')}))` : '';
  const objectCondition = objects ? `FILTER(?object IN (${objects.map(o => `${o}`).join(', ')}))` : '';
  

  const query = `
    SELECT DISTINCT *
    WHERE {
      ?subject ?predicate ?object .
      ${subjectCondition}
      ${predicateCondition}
      ${objectCondition}
    }
    ORDER BY ?subject
    LIMIT ${limit} OFFSET ${page}
  `;
  return executeQuery(dataset, query);
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
  return executeQuery(dataset, query);
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
  return executeQuery(dataset, query);
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
  return executeQuery(dataset, query);
}