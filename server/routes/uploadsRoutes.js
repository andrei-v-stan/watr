import express from 'express';
import { uploadsController } from '../controllers/uploadsController.js';

const router = express.Router();

router.get('/cookie', uploadsController.getCookie);

router.get('/datasets', uploadsController.getDatasets);

router.get('/:filename', uploadsController.getFile);

router.delete('/:filename', uploadsController.deleteFile);

router.put('/:filename', uploadsController.putFile);


router.post('/upload', uploadsController.upload);

export default router;
