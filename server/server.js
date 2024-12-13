import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { filesRouter, sparqlRouter, checkPrerequisites, config } from './routes/index.js'

const app = express();
const PORT = config.portAPI;
const API = config.apiPath;

checkPrerequisites();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 250 * 1024 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: './tmp',
}));
app.use(bodyParser.json());

app.use(`/${API}/files`, filesRouter);
app.use(`/${API}/sparql`, sparqlRouter);

app.get(`/${API}/status`, (req, res) => {
  res.json({ status: 'OK', message: 'Watr Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
