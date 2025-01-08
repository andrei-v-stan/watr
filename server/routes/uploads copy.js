import express from 'express';
import path from 'path';
import fs from 'fs';
import { getUploadsData, saveUploadsData, ensureUserFolder, updateUploadsJson, createCookieIfMissing, verifyUUID, uploadsFolder } from './utils.js';

const router = express.Router();

router.get('/cookie', (req, res) => {
  const uuid = createCookieIfMissing(req, res);

  if (uuid) {
    res.json({
      message: 'Cookie is valid and active.',
      uuid,
    });
  } else {
    res.status(500).json({
      error: 'Failed to create or retrieve cookie.',
    });
  }
});


router.get('/datasets', (req, res) => {
  const uuid = req.cookies['user_uuid'];
  const signature = req.cookies['user_uuid_signature'];

  if (!uuid || !signature || !verifyUUID(uuid, signature)) {
    return res.status(400).json({ error: 'Invalid or missing UUID/signature' });
  }

  const uploads = getUploadsData();
  const sessionData = uploads[uuid];

  if (!sessionData) {
    return res.status(404).json({ error: 'No files found for this UUID' });
  }

  res.json({
    uuid,
    timestamp: new Date(sessionData.timestamp).toLocaleString(),
    files: sessionData.files,
  });
});


router.delete('/:filename', (req, res) => {
  const uuid = req.cookies['user_uuid'];
  const signature = req.cookies['user_uuid_signature'];

  if (!uuid || !signature || !verifyUUID(uuid, signature)) {
    return res.status(400).json({ error: 'Invalid or missing UUID/signature' });
  }

  const sessionFolder = path.join(uploadsFolder, uuid);
  const filePath = path.join(sessionFolder, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Delete the file from the filesystem
  fs.unlinkSync(filePath);

  // Update the JSON to remove the file
  const uploads = getUploadsData();
  if (uploads[uuid]) {
    uploads[uuid].files = uploads[uuid].files.filter((file) => file !== req.params.filename);
    saveUploadsData(uploads);
  }

  res.status(200).json({ message: 'File deleted successfully' });
});

router.put('/:filename', (req, res) => {
  const uuid = req.cookies['user_uuid'];
  const signature = req.cookies['user_uuid_signature'];

  if (!uuid || !signature || !verifyUUID(uuid, signature)) {
    return res.status(400).json({ error: 'Invalid or missing UUID/signature' });
  }

  const sessionFolder = path.join(uploadsFolder, uuid);
  const oldFilePath = path.join(sessionFolder, req.params.filename);
  const newFilePath = path.join(sessionFolder, req.body.newFilename);

  if (!fs.existsSync(oldFilePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Rename the file on the filesystem
  fs.renameSync(oldFilePath, newFilePath);

  // Update the JSON to rename the file
  const uploads = getUploadsData();
  if (uploads[uuid]) {
    uploads[uuid].files = uploads[uuid].files.map((file) =>
      file === req.params.filename ? req.body.newFilename : file
    );
    saveUploadsData(uploads);
  }

  res.status(200).json({ message: 'File renamed successfully' });
});


router.post('/upload', (req, res) => {
  const uuid = createCookieIfMissing(req, res);
  const signature = req.cookies['user_uuid_signature'];

  if (!uuid || !signature || !verifyUUID(uuid, signature)) {
    return res.status(400).json({ error: 'Invalid or missing UUID/signature' });
  }

  const userFolder = ensureUserFolder(uuid);
  const file = req.files?.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join(userFolder, file.name);

  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed', details: err.message });
    }

    updateUploadsJson(uuid, signature, [file.name]);
    res.status(200).json({ message: 'File uploaded successfully', filename: file.name });
  });
});

export default router;
