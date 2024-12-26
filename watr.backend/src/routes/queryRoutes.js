import { Router } from 'express';
import { queryTriple } from '../services/sparqlService.js';

const router = Router();

router.post('/', async (req, res) => {
    const { subject, predicate, object, dataset } = req.body;

    // Validate input
    if (!dataset) {
        return res.status(400).json({ error: 'Dataset is required.' });
    }

    try {
        const results = await queryTriple(subject, predicate, object, dataset);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the query.' });
    }
});

export default router;
