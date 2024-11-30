import express from 'express';
import { executeSPARQLQuery } from '../utils/sparqlClient.js';

const router = express.Router();

router.post('/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'SPARQL query is required.' });
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

export default router;