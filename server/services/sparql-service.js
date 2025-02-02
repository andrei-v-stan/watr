import { QueryEngine } from "@comunica/query-sparql";
import { DataFactory, Store } from "n3";
import * as rdfService from "./rdf-service.js";

export async function getTriplesBySparql(filePath) {
  const queryEngine = new QueryEngine();
  const store = await addQuadsToStore(filePath);

  const sparqlQuery = `
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?subject ?predicate ?object
    WHERE {
      ?subject ?predicate ?object.
    } LIMIT 100
  `;
  try {
    const bindingsStream = await queryEngine.queryBindings(sparqlQuery, {
      sources: [store],
    });

    const bindings = [];
    bindingsStream.on('data', (binding) => {
      bindings.push({
        subject: binding.get('subject').value,
        predicate: binding.get('predicate').value,
        object: binding.get('object').value
      });
    });

    await new Promise((resolve, reject) => {
      bindingsStream.on('end', resolve);
      bindingsStream.on('error', reject);
    });

    return bindings;
  } catch (error) {
    console.error('Error executing SPARQL query:', error);
    throw error;
  }
}

export async function matchDatasets(filePath, otherFilePath, filters = []) {
  const queryEngine = new QueryEngine();

  const store1 = await addQuadsToStore(filePath);
  const store2 = await addQuadsToStore(otherFilePath);

  const filterClauses = createFilterClauses(filters);

  const sparqlQuery = `
      SELECT DISTINCT ?subject ?predicate ?object
      WHERE {
        ?subject ?predicate ?object.
        ${filterClauses}
      }
    `;

  try {
    const [subjects1, subjects2] = await Promise.all([
      executeSparqlQuery(queryEngine, sparqlQuery, store1),
      executeSparqlQuery(queryEngine, sparqlQuery, store2),
    ]);

    const commonSubjects = [...subjects1.keys()].filter(subject => subjects2.has(subject));

    const matchedSubjects = commonSubjects.map(subject => ({
      file: {
        subject: subject,
        details: subjects1.get(subject),
      },
      otherFile: {
        subject: subject,
        details: subjects2.get(subject),
      },
    }));

    return matchedSubjects;
  } catch (error) {
    console.error('Error matching datasets:', error);
    throw new Error('Failed to match datasets');
  }
}

async function addQuadsToStore(filePath) {
  const store = new Store();
  const quadArray = await rdfService.getQuads(filePath);
  const formattedQuads = quadArray.map(quad => DataFactory.quad(
    DataFactory.namedNode(quad.subject.value),
    DataFactory.namedNode(quad.predicate.value),
    DataFactory.namedNode(quad.object.value)
  ));
  store.addQuads(formattedQuads);
  return store;
}

function createFilterClauses(filters) {
  return filters.map(({ predicate, attribute }) =>
    `FILTER (?predicate = <${predicate}> && ?object = ${formatAttribute(attribute)})`
  ).join('\n');
}

async function executeSparqlQuery(queryEngine, sparqlQuery, store) {
  const bindingsStream = await queryEngine.queryBindings(sparqlQuery, {
    sources: [store],
  });

  const subjects = new Map();
  bindingsStream.on('data', (binding) => {
    const subject = binding.get('subject').value;
    const predicate = binding.get('predicate').value;
    const object = binding.get('object').value;

    if (!subjects.has(subject)) {
      subjects.set(subject, []);
    }
    subjects.get(subject).push({ predicate, object });
  });

  await new Promise((resolve, reject) => {
    bindingsStream.on('end', resolve);
    bindingsStream.on('error', reject);
  });

  return subjects;
}

function formatAttribute(attribute) {
  return isValidUrl(attribute) ? `<${attribute}>` : `"${attribute}"^^xsd:string`;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}