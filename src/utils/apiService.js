import axios from 'axios';

const HOST = import.meta.env.VITE_HOST_ADDR;
const PORT = import.meta.env.VITE_PORT_API;
const API = import.meta.env.VITE_API_PATH;

export const querySPARQL = async (endpoint, query) => {
  try {
    const apiUrl = `http://${HOST}:${PORT}/${API}/sparql/query`;
    const response = await axios.post(apiUrl, { endpoint, query });
    return response.data;
  } catch (error) {
    console.error('Error executing SPARQL query:', error);
    throw error;
  }
};

export function convertBindings(conversion, bindings, dataset) {
  switch (conversion) {
    case 'jsonld':
    case 'rj':
      return bindingsToJsonld(bindings, dataset);
    case 'pbrdf':
    case 'rpb':
    case 'rt':
      return bindingsToPbrdf(bindings, dataset);
    case 'trdf':
      return bindingsToTrdf(bindings, dataset);
    case 'trig':
      return bindingsToTrig(bindings, dataset);
    case 'trix':
      return bindingsToTrix(bindings, dataset);
    case 'owl':
    case 'rdf':
      return bindingsToRdfXml(bindings, dataset);
    case 'nq':
      return bindingsToNqNt(bindings, true, dataset);
    case 'nt':
      return bindingsToNqNt(bindings, false, dataset);
    case 'ttl':
      return bindingsToTtl(bindings, dataset);
    case 'html':
      return bindingsToHtml(bindings);
    default:
      return bindings;
  }
}

function bindingsToJsonld(bindings, dataset) {
  let context, idPrefix, predPrefix;
  if (dataset === 'dbpedia') {
    context = {
      "dbpedia": "http://dbpedia.org/resource/",
      "dbo": "http://dbpedia.org/ontology/"
    };
    idPrefix = "dbpedia:";
    predPrefix = "dbo:";
  } else {
    context = {
      "wd": "http://www.wikidata.org/entity/",
      "wdt": "http://www.wikidata.org/prop/direct/"
    };
    idPrefix = "wd:";
    predPrefix = "wdt:";
  }
  const graph = bindings.map(binding => {
    const keys = Object.keys(binding);
    const subjectKey = keys[0];
    const subjectUri = binding[subjectKey].value;
    const localId = subjectUri.split('/').pop();
    const node = { "@id": idPrefix + localId };
    keys.slice(1).forEach(key => {
      const predicate = predPrefix + key.split('/').pop();
      const valueObj = binding[key];
      if (valueObj.type === "uri") {
        node[predicate] = { "@id": valueObj.value };
      } else if (valueObj.type === "literal") {
        if (valueObj.datatype) {
          node[predicate] = { "@value": valueObj.value, "@type": valueObj.datatype };
        } else {
          node[predicate] = { "@value": valueObj.value };
        }
      }
    });
    return node;
  });
  return JSON.stringify({ "@context": context, "@graph": graph }, null, 2);
}

function bindingsToPbrdf(bindings, dataset) {
  let idPrefix, predPrefix, out = '';
  if (dataset === 'dbpedia') {
    idPrefix = 'dbpedia:';
    predPrefix = 'dbo:';
    out += '@prefix dbpedia: <http://dbpedia.org/resource/> .\n';
    out += '@prefix dbo: <http://dbpedia.org/ontology/> .\n\n';
  } else {
    idPrefix = 'wd:';
    predPrefix = 'wdt:';
    out += '@prefix wd: <http://www.wikidata.org/entity/> .\n';
    out += '@prefix wdt: <http://www.wikidata.org/prop/direct/> .\n\n';
  }
  const subjects = {};
  bindings.forEach(binding => {
    const keys = Object.keys(binding);
    const subjectUri = binding[keys[0]].value;
    const subjectLocal = subjectUri.split('/').pop();
    const subject = idPrefix + subjectLocal;
    if (!subjects[subject]) {
      subjects[subject] = [];
    }
    keys.slice(1).forEach(key => {
      const predicate = predPrefix + key.split('/').pop();
      const value = binding[key];
      let object;
      if (value.type === 'uri') {
        object = `<${value.value}>`;
      } else if (value.type === 'literal') {
        if (value.datatype) {
          object = `"${value.value}"^^<${value.datatype}>`;
        } else {
          object = `"${value.value}"`;
        }
      }
      subjects[subject].push({ predicate, object });
    });
  });
  for (const subject in subjects) {
    out += `${subject} `;
    const triples = subjects[subject].map((triple, index, arr) => {
      const separator = (index === arr.length - 1) ? ' .' : ' ;\n    ';
      return `${triple.predicate} ${triple.object}${separator}`;
    });
    out += triples.join('');
    out += '\n';
  }
  return out;
}

function bindingsToTtl(bindings, dataset) {
  let ttlData = '';
  if (dataset === 'dbpedia') {
    ttlData += '@prefix dbpedia: <http://dbpedia.org/resource/> .\n';
    ttlData += '@prefix dbo: <http://dbpedia.org/ontology/> .\n\n';
  } else {
    ttlData += '@prefix wd: <http://www.wikidata.org/entity/> .\n';
    ttlData += '@prefix wdt: <http://www.wikidata.org/prop/direct/> .\n';
    ttlData += '@prefix p: <http://www.wikidata.org/prop/> .\n';
    ttlData += '@prefix ps: <http://www.wikidata.org/prop/statement/> .\n\n';
  }
  if (Array.isArray(bindings)) {
    bindings.forEach(binding => {
      const keys = Object.keys(binding);
      const subjectUri = binding[keys[0]].value;
      const subjectLocal = subjectUri.split('/').pop();
      const subject = dataset === 'dbpedia'
        ? `dbpedia:${subjectLocal}`
        : `wd:${subjectLocal}`;
      let triples = [];
      keys.slice(1).forEach(key => {
        const propertyLocal = key.split('/').pop();
        const propertyUri = dataset === 'dbpedia'
          ? `dbo:${propertyLocal}`
          : `wdt:${propertyLocal}`;
        const value = binding[key];
        if (value.type === 'uri') {
          triples.push(`${subject} ${propertyUri} <${value.value}> .`);
        } else if (value.type === 'literal') {
          if (value.datatype) {
            triples.push(`${subject} ${propertyUri} "${value.value}"^^<${value.datatype}> .`);
          } else {
            triples.push(`${subject} ${propertyUri} "${value.value}" .`);
          }
        }
      });
      ttlData += triples.join('\n') + '\n';
    });
  } else {
    throw new Error("Expected bindings to be an array");
  }
  return ttlData;
}

function bindingsToTrdf(bindings, dataset) {
  let ttlData = '';
  if (dataset === 'dbpedia') {
    ttlData += '@prefix dbpedia: <http://dbpedia.org/resource/> .\n';
    ttlData += '@prefix dbo: <http://dbpedia.org/ontology/> .\n\n';
  } else {
    ttlData += '@prefix wd: <http://www.wikidata.org/entity/> .\n';
    ttlData += '@prefix wdt: <http://www.wikidata.org/prop/direct/> .\n\n';
  }
  bindings.forEach(binding => {
    const bnode = `_:b${Math.random().toString(36).substr(2, 9)}`;
    let triples = [];
    Object.keys(binding).slice(1).forEach(key => {
      const predicate = dataset === 'dbpedia'
        ? `dbo:${key.split('/').pop()}`
        : `wdt:${key.split('/').pop()}`;
      const value = binding[key];
      let object;
      if (value.type === 'uri') {
        object = `<${value.value}>`;
      } else if (value.type === 'literal') {
        if (value.datatype) {
          object = `"${value.value}"^^<${value.datatype}>`;
        } else {
          object = `"${value.value}"`;
        }
      }
      triples.push(`${bnode} ${predicate} ${object} .`);
    });
    ttlData += triples.join('\n') + '\n';
  });
  return ttlData;
}

function bindingsToTrig(bindings, dataset) {
  let trigData = '';
  if (dataset === 'dbpedia') {
    trigData += '@prefix dbpedia: <http://dbpedia.org/resource/> .\n';
    trigData += '@prefix dbo: <http://dbpedia.org/ontology/> .\n\n';
  } else {
    trigData += '@prefix wd: <http://www.wikidata.org/entity/> .\n';
    trigData += '@prefix wdt: <http://www.wikidata.org/prop/direct/> .\n\n';
  }
  trigData += 'GRAPH <http://example.org/graph> {\n';
  bindings.forEach(binding => {
    const keys = Object.keys(binding);
    const subjectUri = binding[keys[0]].value;
    const subjectLocal = subjectUri.split('/').pop();
    const subject = dataset === 'dbpedia'
      ? `dbpedia:${subjectLocal}`
      : `wd:${subjectLocal}`;
    keys.slice(1).forEach(key => {
      const predicate = dataset === 'dbpedia'
        ? `dbo:${key.split('/').pop()}`
        : `wdt:${key.split('/').pop()}`;
      const value = binding[key];
      let object;
      if (value.type === 'uri') {
        object = `<${value.value}>`;
      } else if (value.type === 'literal') {
        if (value.datatype) {
          object = `"${value.value}"^^<${value.datatype}>`;
        } else {
          object = `"${value.value}"`;
        }
      }
      trigData += `  ${subject} ${predicate} ${object} .\n`;
    });
  });
  trigData += '}\n';
  return trigData;
}

function bindingsToTrix(bindings, dataset) {
  let trixData = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  trixData += `<TriX xmlns="http://www.w3.org/2004/03/trix/trix-1/"\n`;
  if (dataset === 'dbpedia') {
    trixData += `      xmlns:dbpedia="http://dbpedia.org/resource/"\n`;
    trixData += `      xmlns:dbo="http://dbpedia.org/ontology/"\n`;
  } else {
    trixData += `      xmlns:wd="http://www.wikidata.org/entity/"\n`;
    trixData += `      xmlns:wdt="http://www.wikidata.org/prop/direct/"\n`;
  }
  trixData += `      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n`;
  trixData += `  <graph>\n`;
  bindings.forEach(binding => {
    const keys = Object.keys(binding);
    const subjectUri = binding[keys[0]].value;
    const subjectLocal = subjectUri.split('/').pop();
    const subject = dataset === 'dbpedia'
      ? `dbpedia:${subjectLocal}`
      : `wd:${subjectLocal}`;
    keys.slice(1).forEach(key => {
      const predicate = dataset === 'dbpedia'
        ? `dbo:${key.split('/').pop()}`
        : `wdt:${key.split('/').pop()}`;
      const value = binding[key];
      trixData += `    <triple>\n`;
      trixData += `      <uri>${subject}</uri>\n`;
      trixData += `      <uri>${predicate}</uri>\n`;
      if (value.type === 'uri') {
        trixData += `      <uri>${value.value}</uri>\n`;
      } else {
        trixData += `      <plainLiteral>${value.value}</plainLiteral>\n`;
      }
      trixData += `    </triple>\n`;
    });
  });
  trixData += `  </graph>\n`;
  trixData += `</TriX>\n`;
  return trixData;
}

function bindingsToRdfXml(bindings, dataset) {
  let rdfData = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  if (dataset === 'dbpedia') {
    rdfData += `<rdf:RDF xmlns:dbo="http://dbpedia.org/ontology/"\n`;
    rdfData += `         xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n`;
  } else {
    rdfData += `<rdf:RDF xmlns:wd="http://www.wikidata.org/entity/"\n`;
    rdfData += `         xmlns:wdt="http://www.wikidata.org/prop/direct/"\n`;
    rdfData += `         xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n`;
  }
  if (!Array.isArray(bindings)) {
    throw new Error("Expected bindings to be an array");
  }
  bindings.forEach(binding => {
    const keys = Object.keys(binding);
    if (keys.length === 0) return;
    const subjectUri = binding[keys[0]].value;
    const subjectLocal = subjectUri.split('/').pop();
    const subject = dataset === 'dbpedia'
      ? subjectUri
      : `wd:${subjectLocal}`;
    let properties = '';
    keys.slice(1).forEach(key => {
      const propertyLocal = key.split('/').pop();
      const propertyUri = dataset === 'dbpedia'
        ? `dbo:${propertyLocal}`
        : `wdt:${propertyLocal}`;
      const value = binding[key];
      properties += value.type === 'uri'
        ? `    <${propertyUri} rdf:resource="${value.value}"/>\n`
        : `    <${propertyUri}>${value.value}</${propertyUri}>\n`;
    });
    rdfData += `  <rdf:Description rdf:about="${subject}">\n${properties}  </rdf:Description>\n`;
  });
  rdfData += `</rdf:RDF>`;
  return rdfData;
}

function bindingsToNqNt(bindings, isNq, dataset) {
  if (!Array.isArray(bindings)) {
    throw new Error("Expected bindings to be an array");
  }
  return bindings
    .map(binding => {
      const keys = Object.keys(binding);
      if (keys.length === 0) return '';
      const subjectUri = binding[keys[0]].value;
      const subject = `<${subjectUri}>`;
      return keys.slice(1)
        .map(key => {
          const propertyUri = dataset === 'dbpedia'
            ? `<http://dbpedia.org/ontology/${key.split('/').pop()}>`
            : `<${key}>`;
          const value = binding[key];
          return value.type === 'uri'
            ? `${subject} ${propertyUri} <${value.value}> ${isNq ? '<http://example.org/graph>' : ''} .`
            : `${subject} ${propertyUri} "${value.value}" ${isNq ? '<http://example.org/graph>' : ''} .`;
        })
        .join('\n');
    })
    .filter(line => line !== '')
    .join('\n');
}

function bindingsToHtml(bindings) {
  if (!Array.isArray(bindings) || bindings.length === 0) {
    return '<html><head><meta charset="utf-8"></head><body><table><thead></thead><tbody></tbody></table></body></html>';
  }
  const headers = Object.keys(bindings[0]);
  let html = `<html><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>`;
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += `</tr></thead><tbody>`;
  bindings.forEach(binding => {
    html += `<tr>`;
    headers.forEach(header => {
      const value = binding[header] ? binding[header].value : '';
      html += `<td>${value}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table></body></html>`;
  return html;
}
