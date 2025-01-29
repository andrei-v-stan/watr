import path from 'path';
import { utilsService } from '../services/utilsService.js';
import { sparqlService } from '../services/sparqlService.js';

export const sparqlController = {
  async getTriples(req, res) {
    console.log('Getting triples');
    const sessionFolder = path.join(utilsService.uploadsFolder, req.cookies['user_uuid']);
    const filePath = path.join(sessionFolder, req.query.file);

    try {
      const triples = await sparqlService.parseAndOrganizeDataset(filePath);
      res.json(triples);
    } catch (error) {
      console.error('Error parsing the dataset:', error);
      res.status(500).json({ error: 'Error parsing the dataset' });
    }
  },

  async getPredicatesAttributes(req, res) {
    const { file } = req.query;
    try {
      const predicates = await sparqlService.getPredicatesFromFile(file);
      const attributes = await sparqlService.getAttributesFromFile(file);
      res.json({ predicates, attributes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async classify(req, res) {
    const { file, predicate, attribute } = req.query;
    try {
      const subjects = await sparqlService.getSubjectsByPredicateAndAttribute(file, predicate, attribute);
      res.json({ subjects });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};