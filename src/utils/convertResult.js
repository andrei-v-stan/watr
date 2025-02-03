const labelCache = {};

async function getLabel(iri) {
  if (labelCache[iri]) return labelCache[iri];
  let endpoint = "";
  if (iri.startsWith("http://www.wikidata.org/entity/") || iri.startsWith("https://www.wikidata.org/entity/")) {
    endpoint = "https://query.wikidata.org/sparql";
  } else if (iri.startsWith("http://dbpedia.org/resource/") || iri.startsWith("https://dbpedia.org/resource/")) {
    endpoint = "https://dbpedia.org/sparql";
  } else {
    labelCache[iri] = getLocalPart(iri);
    return labelCache[iri];
  }
  const query = `
    SELECT ?label WHERE {
      <${iri}> rdfs:label ?label .
      FILTER (lang(?label) = "en")
    } LIMIT 1
  `;
  const url = endpoint + "?query=" + encodeURIComponent(query);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/sparql-results+json" }
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const json = await response.json();
    const bindings = json.results.bindings;
    if (bindings.length > 0 && bindings[0].label && bindings[0].label.value) {
      labelCache[iri] = bindings[0].label.value;
      return labelCache[iri];
    }
  } catch (error) {
    console.error(error);
  }
  labelCache[iri] = getLocalPart(iri);
  return labelCache[iri];
}

function getLocalPart(iri) {
  const PREFIXES = [
    { base: "http://www.wikidata.org/entity/" },
    { base: "http://www.wikidata.org/prop/direct/" },
    { base: "http://dbpedia.org/resource/" },
    { base: "http://dbpedia.org/ontology/" }
  ];
  for (let { base } of PREFIXES) {
    if (iri.startsWith(base)) {
      return iri.slice(base.length);
    }
  }
  return iri;
}

function getContext(triples) {
  const PREFIXES = [
    { base: "http://www.wikidata.org/entity/", prefix: "wd" },
    { base: "http://www.wikidata.org/prop/direct/", prefix: "wdt" },
    { base: "http://dbpedia.org/resource/", prefix: "dbpedia" },
    { base: "http://dbpedia.org/ontology/", prefix: "dbo" }
  ];
  const context = {};
  triples.forEach(triple => {
    ["subject", "predicate", "object"].forEach(key => {
      const value = triple[key];
      if (typeof value === "string" && value.startsWith("http")) {
        PREFIXES.forEach(({ base, prefix }) => {
          if (value.startsWith(base)) {
            context[prefix] = base;
          }
        });
      }
    });
  });
  return context;
}

export async function convertTriplesToHTML(triples) {
  if (!triples.length) return "<p>No data available</p>";
  const headers = Object.keys(triples[0]);
  const tableHeaders = headers.map(header => `<th>${header}</th>`).join("");
  const tableRows = await Promise.all(
    triples.map(async triple => {
      const cells = await Promise.all(
        headers.map(async header => {
          let value = triple[header] || "";
          if (typeof value === "string" && value.startsWith("http")) {
            const label = await getLabel(value);
            value = `<a href="${value}" target="_blank">${label}</a>`;
          }
          return `<td>${value}</td>`;
        })
      );
      return `<tr>${cells.join("")}</tr>`;
    })
  );
  return `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows.join("")}</tbody>
        </table>
      </body>
    </html>`;
}

export async function convertTriplesToJSONLD(triples) {
  if (!triples.length) return JSON.stringify({}, null, 2);
  const context = getContext(triples);
  const jsonldArray = await Promise.all(
    triples.map(async triple => {
      const subj = typeof triple.subject === "string" && triple.subject.startsWith("http")
        ? triple.subject
        : triple.subject;
      const pred = typeof triple.predicate === "string" && triple.predicate.startsWith("http")
        ? triple.predicate
        : triple.predicate;
      let obj;
      if (typeof triple.object === "string" && triple.object.startsWith("http")) {
        if (pred.toLowerCase().includes("label")) {
          const lbl = await getLabel(triple.object);
          obj = { "@value": lbl };
        } else {
          obj = { "@id": triple.object };
        }
      } else {
        const literal = triple.object;
        if (!isNaN(literal)) {
          obj = { "@value": literal, "@type": "http://www.w3.org/2001/XMLSchema#decimal" };
        } else if (typeof literal === "string" && literal.startsWith("Point(")) {
          obj = { "@value": literal, "@type": "http://www.opengis.net/ont/geosparql#wktLiteral" };
        } else {
          obj = { "@value": literal };
        }
      }
      return Object.assign({ "@id": subj }, { [pred]: obj });
    })
  );
  const output = { "@context": context, "@graph": jsonldArray };
  return JSON.stringify(output, null, 2);
}

export async function convertTriplesToCSV(triples) {
  if (!triples.length) return "No data available";
  const headers = Object.keys(triples[0]);
  const csvRows = await Promise.all(
    triples.map(async triple => {
      const row = await Promise.all(
        headers.map(async header => {
          let value = triple[header] || "";
          if (typeof value === "string" && value.startsWith("http")) {
            value = await getLabel(value);
          }
          return `"${value}"`;
        })
      );
      return row.join(",");
    })
  );
  return [headers.join(","), ...csvRows].join("\n");
}
