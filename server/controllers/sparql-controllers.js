import path from 'path';
import { uploadsFolder } from '../services/uploads-service.js';
import { getClassifiedSubjects, getDistinctAttributes, getDistinctPredicates, parseAndOrganizeDataset } from '../services/sparql-service.js';

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
    },

    async getDistinctPredicates(req, res) {
        const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
        const filePath = path.join(sessionFolder, req.query.file);

        try {
            const predicates = await getDistinctPredicates(filePath);
            res.json(predicates);
        } catch (error) {
            console.error('Error getting distinct predicates:', error);
            res.status(500).json({ error: 'Error getting distinct predicates' });
        }
    },

    async getDistinctAttributes(req, res) {
        const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
        const filePath = path.join(sessionFolder, req.query.file);

        try {
            const attributes = await getDistinctAttributes(filePath, req.query.predicate);
            res.json(attributes);
        } catch (error) {
            console.error('Error getting distinct attributes:', error);
            res.status(500).json({ error: 'Error getting distinct attributes' });
        }
    },

    async classify(req, res) {
        const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
        const filePath = path.join(sessionFolder, req.body.file);

        try {
            const subjects = await getClassifiedSubjects(filePath, req.body.operation, req.body.pairs);
            res.json(subjects);
        } catch (error) {
            console.error('Error classifying the dataset:', error);
            res.status(500).json({ error: 'Error classifying the dataset' });
        }
    }
}