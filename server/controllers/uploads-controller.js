import path from 'path';
import fs from 'fs';
import { getUploadsData, saveUploadsData, ensureUserFolder, updateUploadsJson, createCookieIfMissing, verifyUUID, uploadsFolder } from '../services/uploads-service.js';

export const getCookie = (req, res) => {
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
};

export const getDatasets = (req, res) => {
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
};

export const getFile = (req, res) => {
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

  res.sendFile(path.resolve(filePath));
};

export const deleteFile = (req, res) => {
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

  fs.unlinkSync(filePath);

  const uploads = getUploadsData();
  if (uploads[uuid]) {
    uploads[uuid].files = uploads[uuid].files.filter((file) => file !== req.params.filename);
    saveUploadsData(uploads);
  }

  res.status(200).json({ message: 'File deleted successfully' });
};

export const renameFile = (req, res) => {
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

  fs.renameSync(oldFilePath, newFilePath);

  const uploads = getUploadsData();
  if (uploads[uuid]) {
    uploads[uuid].files = uploads[uuid].files.map((file) =>
      file === req.params.filename ? req.body.newFilename : file
    );
    saveUploadsData(uploads);
  }

  res.status(200).json({ message: 'File renamed successfully' });
};

export const uploadFile = (req, res) => {
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
};