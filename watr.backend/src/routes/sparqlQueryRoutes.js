import { Router } from 'express';
import { sparqlQuery } from '../services/sparqlService.js';
import { Parser as SparqlParser } from 'sparqljs';

const router = Router();

router.post('/', async (req, res) => {
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
        const results = await sparqlQuery(query);
        res.json(results);
    } catch (error) {
        console.error('Error executing SPARQL query:', error.message);
        res.status(500).json({ error: 'Failed to execute the SPARQL query.' });
    }
});

export default router;
