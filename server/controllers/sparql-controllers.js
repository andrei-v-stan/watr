import path from 'path';
import { uploadsFolder } from '../services/uploads-service.js';
import { parseAndOrganizeDataset } from '../services/sparql-service.js';

export const sparqlController = {
    async getTriples(req, res) {
        const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
        const filePath = path.join(sessionFolder, req.query.file);

        try {
            const triples = await parseAndOrganizeDataset(filePath);
            res.json(triples);
        } catch (error) {
            console.error('Error parsing the dataset:', error);
            res.status(500).json({ error: 'Error parsing the dataset' });
        }
    }
}