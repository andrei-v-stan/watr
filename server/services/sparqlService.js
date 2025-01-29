import N3Parser from '@rdfjs/parser-n3';
import { createReadStream } from 'fs';
import streamToArray from 'stream-to-array';
import fs from 'fs/promises';
import axios from 'axios';

export const sparqlService = {
  async parseAndOrganizeDataset(filePath) {
    console.log('Parsing dataset:', filePath);
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
  },

  async getPredicatesFromFile(filePath) {
    const parser = new N3Parser();
    const rdfStream = createReadStream(filePath);
    const quadStream = parser.import(rdfStream);
    const quads = await streamToArray(quadStream);
    const predicates = [];

    quads.forEach((quad) => {
      predicates.push(quad.predicate.value);
    });

    return predicates;
  },
  
  async getObjectsByPredicateFromFile(file) {
    const data = await fs.readFile(file, 'utf8');
    const quads = parser.parse(data);
    const attributes = new Set();
  
    quads.forEach(quad => {
      attributes.add(quad.object.value);
    });
  
    return Array.from(attributes);
  },

  async executeSPARQLQuery(query) {
    const endpointUrl = 'https://query.wikidata.org/sparql';
    return await executeQuery(endpointUrl, query);
  },

  async queryTriple(subjects, predicates, objects, dataset, page, limit) {
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
  },

  async querySubjects(dataset, page, limit) {
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
  },

  async queryPredicates(dataset, page, limit) {
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
  },

  async queryObjects(dataset, page, limit) {
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
}

async function executeQuery(endpointUrl, query) {
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