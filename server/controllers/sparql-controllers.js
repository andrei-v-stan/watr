import path from 'path';
import fs from 'fs';
import { uploadsFolder } from '../services/uploads-service.js';
import { getClassifiedSubjects, getDistinctAttributes, getDistinctPredicates, getMatchedSubjects, parseAndOrganizeDataset, validateDataset, runSPARQLQuery } from '../services/sparql-service.js';

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

  async getValidation(req, res) {
    const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
    const filePath = path.join(sessionFolder, req.query.file);
    const shapesPath = path.join('uploads/examples/shapes/', path.basename(filePath));

    if (!fs.existsSync(shapesPath)) {
      console.error('Shapes file not found:', shapesPath);
      res.status(404).json({ error: 'Shapes file not found' });
      return;
    }
    else {
      try {
        const validationReport = await validateDataset(filePath, shapesPath);
        res.json(validationReport);
      } catch (error) {
        console.error('Error parsing the dataset:', error);
        res.status(500).json({ error: 'Error parsing the dataset' });
      }
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
  },

  async match(req, res) {
    const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
    const filePath = path.join(sessionFolder, req.body.file);

    try {
      const subjects = await getMatchedSubjects(filePath, req.body.matchingSelectedFile, req.body.pairs, req.body.comparisonMode, req.body.matchByPredicates);
      res.json(subjects);
    } catch (error) {
      console.error('Error matching the dataset:', error);
      res.status(500).json({ error: 'Error matching the dataset' });
    }
  },

  async executeQuery(req, res) {
    const { endpoint, query } = req.body;
    try {
        const results = await runSPARQLQuery(endpoint, query);
        res.json(results);
    } catch (error) {
        console.error('Error executing SPARQL query:', error);
        res.status(500).json({ error: 'Error executing SPARQL query' });
    }
  }
}