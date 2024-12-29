import express from 'express';
import { executeSPARQLQuery, queryTriple, querySubjects, queryPredicates, queryObjects } from '../utils/sparqlClient.js';

const router = express.Router();

router.post('/query', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'SPARQL query is required.' });
  }

  try {
    const parser = new SparqlParser();
    parser.parse(query);
  } catch (error) {
    console.error('Invalid SPARQL query:', error.message);
    return res.status(400).json({ error: 'Invalid SPARQL query syntax.' });
  }

  try {
    const results = await executeSPARQLQuery(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(`/status`, (req, res) => {
  res.json({ status: 'OK', message: 'Watr SparQL is responding!' });
});

// https://query.wikidata.org/
router.get('/test', async (req, res) => {
  const query = `
    #Cats
    SELECT ?item ?itemLabel
    WHERE
    {
      ?item wdt:P31 wd:Q146. # Must be a cat
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". } # Helps get the label in your language, if not, then default for all languages, then en language
    }
      LIMIT 10
  `;

  try {
    const results = await executeSPARQLQuery(query);
    res.json(results);  // Return the results in the response
  } catch (error) {
    res.status(500).json({ error: `${error.message}`});
  }
});

router.post('/triple', async (req, res) => {
  const { subject, predicate, object, dataset } = req.body;
  const { page, limit } = req.query;
  
  if (!dataset) {
      return res.status(400).json({ error: 'Dataset is required.' });
  }

  try {
      const results = await queryTriple(subject, predicate, object, dataset, page, limit);
      res.json(results);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process the query.' });
  }
});

/**
 * Fetch all subjects from a given dataset.
 */
router.post('/subjects', async (req, res) => {
  const { dataset } = req.body;
  const { page, limit } = req.query;

  if (!dataset) {
      return res.status(400).json({ error: 'Dataset is required.' });
  }

  try {
    const results = await querySubjects(dataset, page, limit);
    res.json(results);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

router.post('/predicates', async (req, res) => {
  const { dataset } = req.body;
  const { page, limit } = req.query;

  if (!dataset) {
      return res.status(400).json({ error: 'Dataset is required.' });
  }

  try {
    const results = await queryPredicates(dataset, page, limit);
    res.json(results);
  } catch (error) {
    console.error('Error fetching predicates:', error);
    res.status(500).json({ error: 'Failed to fetch predicates.' });
  }
});

router.post('/objects', async (req, res) => {
  const { dataset } = req.body;
  const { page, limit } = req.query;

  if (!dataset) {
      return res.status(400).json({ error: 'Dataset is required.' });
  }

  try {
    const results = await queryObjects(dataset, page, limit);
    res.json(results);
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ error: 'Failed to fetch objects.' });
  }
});

export default router;