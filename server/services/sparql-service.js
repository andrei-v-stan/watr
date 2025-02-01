import axios from 'axios';
import fs from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import streamToArray from 'stream-to-array';
import N3Parser from '@rdfjs/parser-n3';
import jsonld from 'jsonld';
import { fromFile } from 'rdf-utils-fs';
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import { QueryEngine } from '@comunica/query-sparql';


async function getQuads(filePath) {
  const extension = filePath.substring(filePath.lastIndexOf('.')).trim().toLowerCase();
  const rdfStream = createReadStream(filePath);
  
  try {
      if (['.jsonld', '.rj'].includes(extension)) {
        const data = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
        return await jsonld.toRDF(data);
      }
      else if (['.owl', '.trix'].includes(extension)) {
        const parser = new RdfXmlParser();
        const quadStream = parser.import(rdfStream);
        return await streamToArray(quadStream);
      }
      else if (extension === '.rdf') {
        return await streamToArray(fromFile(filePath));
      }
      else if (['.nq', '.nt', '.pbrdf', '.rpb', '.rt', '.trdf', '.trig', '.ttl'].includes(extension)) {
        const parser = new N3Parser();
        const quadStream = parser.import(rdfStream);
        return await streamToArray(quadStream);
      }
      else {
        const fallbackStream = Readable.from([
          {
            subject: { value: "Subjects N A" },
            predicate: { value: "Predicates N A" },
            object: { value: "Objects N A" },
          }
        ]);

      return await streamToArray(fallbackStream);
    }
  } 
  catch (error) {
    console.error(`Error processing file "${filePath}":`, error.message);
    throw new Error(`Failed to process file "${filePath}"`);
  }
}

function isValidSubject(quad, predicate, attribute) {
  return quad.predicate.value === predicate && quad.object.value === attribute;
}

async function getSubjectsByPairsUnion(quads, pairs) {
  const subjects = new Set();
  quads.forEach((quad) => {
    if (pairs.some(pair => isValidSubject(quad, pair.predicate, pair.attribute))) {
      subjects.add(quad.subject.value);
    }
  });

  return Array.from(subjects);
}

async function getSubjectsByPairsIntersection(quads, pairs) {
  const subjectMap = new Map();

  quads.forEach((quad) => {
    pairs.forEach(pair => {
      if (isValidSubject(quad, pair.predicate, pair.attribute)) {
        if (!subjectMap.has(quad.subject.value)) {
          subjectMap.set(quad.subject.value, new Set());
        }
        subjectMap.get(quad.subject.value).add(pair);
      }
    });
  });

  const subjects = [];
  subjectMap.forEach((matchedPairs, subject) => {
    if (matchedPairs.size === pairs.length) {
      subjects.push(subject);
    }
  });

  return subjects;
}

async function loadRDFFile(filePath) {
  console.log('Loading RDF file:', filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function parseAndOrganizeDataset(filePath) {
  const quads = await getQuads(filePath);
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

export async function getTriplesBySparql(filePath) {
  const rdfData = await loadRDFFile(filePath); // Load RDF data from file
  const queryEngine = new QueryEngine(); // Create a new Comunica query engine

  const query = `
    SELECT ?subject ?predicate ?object
    WHERE {
      ?subject ?predicate ?object.
    }
  `;
  console.log('Executing SPARQL query:', query);

  // Execute SPARQL query
  const bindingsStream = await queryEngine.queryBindings(query, {
    sources: [rdfData],
  });

  console.log('Processing query results...');
  bindingsStream.on('data', (binding) => {
    console.log(binding.toString()); // Quick way to print bindings for testing

    console.log(binding.has('s')); // Will be true

    // Obtaining values
    console.log(binding.get('s').value);
    console.log(binding.get('s').termType);
    console.log(binding.get('p').value);
    console.log(binding.get('o').value);
  });

  // Process query results
  const queryResults = [];
  for await (const binding of bindingsStream) {
    queryResults.push(binding);
  }

  console.log('Query Results:', queryResults);
  console.log('Number of Triples:', queryResults.length);
  return queryResults;
}

export async function getDistinctPredicates(filePath) {
  const quads = await getQuads(filePath);
  const predicates = new Set();

  quads.forEach((quad) => {
    predicates.add(quad.predicate.value);
  });

  return Array.from(predicates);
}

export async function getDistinctAttributes(filePath, predicate) {
  const quads = await getQuads(filePath);
  const attributes = new Set();

  quads.forEach((quad) => {
    if (quad.predicate.value === predicate) {
      attributes.add(quad.object.value);
    }
  });

  return Array.from(attributes);
}

export async function getClassifiedSubjects(filePath, operation, pairs) {
  const quads = await getQuads(filePath);

  switch (operation) {
    case 'Union': {
      return getSubjectsByPairsUnion(quads, pairs);
    }
    case 'Intersection': {
      return getSubjectsByPairsIntersection(quads, pairs);
    }
    default: {
      return [];
    }
  }
}

export async function getSubjectsByPairs(filePath, pairs) {
  const quads = await getQuads(filePath);
  const subjects = new Set();

  quads.forEach((quad) => {
    pairs.forEach(pair => {
      if (quad.predicate.value === pair.predicate && quad.object.value === pair.attribute) {
        subjects.add(quad.subject.value);
      }
    });
  });

  return Array.from(subjects);
}

export async function getMatchedSubjects(file, matchingSelectedFile, pairs, comparisonMode, matchByPredicates) {
  const quads1 = await getQuads(file);
  const quads2 = await getQuads(matchingSelectedFile);

  const subjects1 = new Map();
  const subjects2 = new Map();

  const addSubject = (quads, subjectsMap) => {
    quads.forEach((quad) => {
      if (pairs.some(pair => isValidSubject(quad, pair.predicate, pair.attribute))) {
        if (!subjectsMap.has(quad.subject.value)) {
          subjectsMap.set(quad.subject.value, new Map());
        }
        const predicatesMap = subjectsMap.get(quad.subject.value);
        predicatesMap.set(quad.predicate.value, quad.object.value);
      }
    });
  };

  addSubject(quads1, subjects1);
  addSubject(quads2, subjects2);
  console.log('Subjects 1:', subjects1);
  console.log('Subjects 2:', subjects2);

  const matchedSubjects = [];

  if (comparisonMode === 'Subject') {
    subjects1.forEach((_, subject) => {
      if (subjects2.has(subject)) {
        matchedSubjects.push(subject);
      }
    });
  } else if (comparisonMode === 'Predicate-Attribute') {
    subjects1.forEach((predicatesMap1, subject) => {
      if (subjects2.has(subject)) {
        const predicatesMap2 = subjects2.get(subject);
        const allMatch = matchByPredicates.every(predicate => 
          predicatesMap1.get(predicate) === predicatesMap2.get(predicate)
        );
        if (allMatch) {
          matchedSubjects.push(subject);
        }
      }
    });
  }

  return matchedSubjects;
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
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to execute SPARQL query: ${error.message}`);
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
 * @param {string[]} subjects - The subjects to filter by.
 * @param {string[]} predicates - The predicates to filter by.
 * @param {string[]} objects - The objects to filter by.
 * @param {string} dataset - The SPARQL endpoint URL (dataset).
 * @param {number} page - The page number.
 * @param {number} limit - The number of results per page.
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

  if (!page) {
    page = 0;
  }
  if (!limit) {
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
  if (!page) {
    page = 0;
  }
  if (!limit) {
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
  if (!page) {
    page = 0;
  }
  if (!limit) {
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
  if (!page) {
    page = 0;
  }
  if (!limit) {
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


import SHACLValidator from 'rdf-validate-shacl';
import rdf from 'rdf-ext';

async function loadDataset(filePath) {
  const rdfStream = createReadStream(filePath);
  const parser = new N3Parser();
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);

  return rdf.dataset(quads);
}

async function loadShapes(shapesFilePath) {
  const rdfStream = createReadStream(shapesFilePath);
  const parser = new N3Parser();
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);

  return rdf.dataset(quads);
}


export async function validateDataset(dataFilePath, shapesFilePath) {
  const data = await loadDataset(dataFilePath);
  const shapes = await loadShapes(shapesFilePath);

  const validator = new SHACLValidator(shapes);
  const report = validator.validate(data);

  return {
    conforms: report.conforms,
    results: report.results.map(result => ({
      focusNode: result.focusNode.value,
      path: result.path ? result.path.value : null,
      message: result.message[0] || "Constraint violated",
    })),
  };
}

export async function runSPARQLQuery(endpoint, query) {
  try {
      const response = await axios.post(endpoint, {
          query: query,
      }, {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
      });
      return response.data;
  } catch (error) {
      console.error('Error executing SPARQL query:', error);
      throw new Error('Failed to execute SPARQL query');
  }
}