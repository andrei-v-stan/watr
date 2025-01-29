import express from 'express';
import cookieParser from 'cookie-parser';
import { sparqlController } from '../controllers/sparql-controllers.js';

const router = express.Router();
router.use(cookieParser());

router.get('/triples', sparqlController.getTriples);

export default router;