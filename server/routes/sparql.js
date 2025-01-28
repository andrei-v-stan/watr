import N3Parser from '@rdfjs/parser-n3';
import { createReadStream } from 'fs';
import streamToArray from 'stream-to-array';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { uploadsFolder } from './utils.js';
import sparqlClient from '../utils/sparqlClient';

const router = express.Router();
router.use(cookieParser());

router.get('/triples', async (req, res) => {
  const sessionFolder = path.join(uploadsFolder, req.cookies['user_uuid']);
  const filePath = path.join(sessionFolder, req.query.file);

  try {
    const triples = await parseAndOrganizeDataset(filePath);
    res.json(triples);
  } catch (error) {
    console.error('Error parsing the dataset:', error);
    res.status(500).json({ error: 'Error parsing the dataset' });
  }
});

router.get('/sparql/predicates-attributes', async (req, res) => {
  const { file } = req.query;
  try {
    const predicates = await sparqlClient.getPredicatesFromFile(file);
    const attributes = await sparqlClient.getAttributesFromFile(file);
    res.json({ predicates, attributes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sparql/classify', async (req, res) => {
  const { file, predicate, attribute } = req.query;
  try {
    const subjects = await sparqlClient.getSubjectsByPredicateAndAttribute(file, predicate, attribute);
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function parseAndOrganizeDataset(filePath) {
  const parser = new N3Parser();
  const rdfStream = createReadStream(filePath);
  const quadStream = parser.import(rdfStream);
  const quads = await streamToArray(quadStream);
  const triples = [];

  quads.forEach((quad) => {
    triples.push({
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: quad.object.value,
    });
  });

  return triples;
}

export default router;