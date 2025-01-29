import express from 'express';
import * as uploadsController from '../controllers/uploads-controller.js';

const router = express.Router();

router.get('/cookie', uploadsController.getCookie);

router.get('/datasets', uploadsController.getDatasets);

router.get('/:filename', uploadsController.getFile);

router.delete('/:filename', uploadsController.deleteFile);

router.put('/:filename', uploadsController.renameFile);

router.post('/upload', uploadsController.uploadFile);

export default router;
