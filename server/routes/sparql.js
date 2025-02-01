import express from 'express';
import cookieParser from 'cookie-parser';
import { sparqlController } from '../controllers/sparql-controllers.js';

const router = express.Router();
router.use(cookieParser());

router.get('/triples', sparqlController.getTriples);

router.get('/validate', sparqlController.getValidation);

router.get('/predicates', sparqlController.getDistinctPredicates);

router.get('/attributes', sparqlController.getDistinctAttributes);

router.post('/classify', sparqlController.classify);

router.post('/match', sparqlController.match);

router.post('/query', sparqlController.executeQuery);

export default router;