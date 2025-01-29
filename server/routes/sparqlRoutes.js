import express from 'express';
import cookieParser from 'cookie-parser';
import { sparqlController } from '../controllers/sparqlController.js';

const sparqlRouter = express.Router();
sparqlRouter.use(cookieParser());

sparqlRouter.get('/triples', sparqlController.getTriples);

sparqlRouter.get('/predicates-attributes', sparqlController.getPredicatesAttributes);

sparqlRouter.get('/classify', sparqlController.classify);

export default sparqlRouter;