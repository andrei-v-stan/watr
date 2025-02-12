import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { filesRouter, sparqlRouter, checkPrerequisites } from './routes/index.js';
import process  from 'process';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const HOST = process.env.VITE_HOST_ADDR;
const PORT = process.env.VITE_PORT_API;
const API = process.env.VITE_API_PATH;
const VITE = process.env.VITE_PORT_APP;

export { HOST, PORT, API, VITE };
checkPrerequisites();

app.use(cors({
  origin: `http://${HOST}:5173`,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
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

app.use('*', (req, res) => {
  const errorCode = 404;
  const errorMessage = 'API Call Not Found';
  res.redirect(`http://${HOST}:${VITE}/redir?code=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
});



app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
