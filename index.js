import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { filesRouter, sparqlRouter, checkPrerequisites } from './server/routes/index.js';
import cors from 'cors';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const HOST = process.env.VITE_HOST_ADDR;
const PORT = process.env.VITE_PORT_API;
const API = process.env.VITE_API_PATH;
checkPrerequisites();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload({
  limits: { fileSize: 250 * 1024 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: './tmp',
}));

app.use(express.static(path.join(__dirname, 'dist')));

app.use(`/${API}/files`, filesRouter);
app.use(`/${API}/sparql`, sparqlRouter);

app.get(`/${API}/status`, (req, res) => {
  res.json({ status: 'OK', message: 'Watr Backend is running!' });
});

app.get('/dist/assets/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/assets', req.params.file));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
