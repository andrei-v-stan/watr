import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

const router = express.Router();

const uploadsFolder = 'uploads';
const uploadsJsonPath = `${uploadsFolder}/uploads.json`;

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}
if (!fs.existsSync(uploadsJsonPath)) {
  fs.writeFileSync(uploadsJsonPath, JSON.stringify({}, null, 2));
}


const upload = multer({ dest: path.join(uploadsFolder, 'temp/') });

const updateUploadsJson = (sessionId, files) => {
  const uploads = JSON.parse(fs.readFileSync(uploadsJsonPath));

  uploads[sessionId] = {
    timestamp: Date.now(),
    files: [...new Set([...(uploads[sessionId]?.files || []), ...files])],
  };

  fs.writeFileSync(uploadsJsonPath, JSON.stringify(uploads, null, 2));
};

router.post('/', upload.array('files'), (req, res) => {
  if (!req.session.id) {
    return res.status(400).json({ error: 'Session not found' });
  }

  const sessionFolder = path.join(uploadsFolder, req.session.id);
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

  const savedFiles = [];

  try {
    req.files.forEach((file) => {
      const destination = path.join(sessionFolder, file.originalname);

      fs.renameSync(file.path, destination);
      savedFiles.push(file.originalname);
    });

   /*
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const startTime = Date.now();
    const elapsedTime = (Date.now() - startTime) / 1000;
    const speed = (totalSize / elapsedTime / 1024 / 1024).toFixed(2);
    console.log(
      `Upload completed: ${req.files.length} files, ${totalSize} bytes in ${elapsedTime.toFixed(2)} seconds (${speed} MB/s)`
    );
    */

    updateUploadsJson(req.session.id, savedFiles);
    return res.status(200).json({ message: 'Files uploaded successfully', status: 'success' });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error uploading files', status: 'error' });
  }
});

cron.schedule('0 */6 * * *', () => {
  const uploads = JSON.parse(fs.readFileSync(uploadsJsonPath));
  const currentTime = Date.now();

  Object.keys(uploads).forEach((sessionId) => {
    if (currentTime - uploads[sessionId].timestamp > 24 * 60 * 60 * 1000) {
      const sessionFolder = path.join(uploadsFolder, sessionId);
      if (fs.existsSync(sessionFolder)) fs.rmSync(sessionFolder, { recursive: true });

      delete uploads[sessionId];
    }
  });

  fs.writeFileSync(uploadsJsonPath, JSON.stringify(uploads, null, 2));
});

export default router;
