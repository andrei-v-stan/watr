import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadsFolder = 'uploads';
const uploadsJsonPath = `${uploadsFolder}/uploads.json`;

router.get("/session", (req, res) => {
  if (!req.session.id) {
    return res.status(400).json({ error: "Session not found" });
  }

  const uploads = JSON.parse(fs.readFileSync(uploadsJsonPath, "utf8"));
  const sessionData = uploads[req.session.id];

  if (!sessionData) {
    return res.status(404).json({ error: "No files found for this session" });
  }

  res.json({
    sessionId: req.session.id,
    timestamp: new Date(sessionData.timestamp).toLocaleString(),
    files: sessionData.files,
  });
});

router.get("/file/:filename", (req, res) => {
  if (!req.session.id) {
    return res.status(400).json({ error: "Session not found" });
  }

  const sessionFolder = path.join(uploadsFolder, req.session.id);
  const filePath = path.join(sessionFolder, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
});

export default router;
