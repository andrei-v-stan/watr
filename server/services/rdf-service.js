import axios from 'axios';
import fs from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import streamToArray from 'stream-to-array';
import N3Parser from '@rdfjs/parser-n3';
import jsonld from 'jsonld';
import { fromFile } from 'rdf-utils-fs';
import { RdfXmlParser } from 'rdfxml-streaming-parser';
import SHACLValidator from 'rdf-validate-shacl';
import rdf from 'rdf-ext';

export async function getQuads(filePath) {
  const extension = filePath.substring(filePath.lastIndexOf('.')).trim().toLowerCase();
  const rdfStream = createReadStream(filePath);

  try {
    if (['.jsonld', '.rj'].includes(extension)) {
      const data = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
      return await jsonld.toRDF(data);
    } else if (['.owl', '.trix'].includes(extension)) {
      const parser = new RdfXmlParser();
      const quadStream = parser.import(rdfStream);
      return await streamToArray(quadStream);
    } else if (extension === '.rdf') {
      return await streamToArray(fromFile(filePath));
    } else if (['.nq', '.nt', '.pbrdf', '.rpb', '.rt', '.trdf', '.trig', '.ttl'].includes(extension)) {
      const parser = new N3Parser();
      const quadStream = parser.import(rdfStream);
      return await streamToArray(quadStream);
    } else {
      const fallbackStream = Readable.from([
        {
          subject: { value: "Subjects N A" },
          predicate: { value: "Predicates N A" },
          object: { value: "Objects N A" },
        }
      ]);

      return await streamToArray(fallbackStream);
    }
  } catch (error) {
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