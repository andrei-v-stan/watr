import { Router } from 'express';
import { sparqlQuery } from '../services/sparqlService.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const query = `SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10`;
        const results = await sparqlQuery(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;