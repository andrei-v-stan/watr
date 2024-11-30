import express from 'express';
import bodyParser from 'body-parser';
import sparqlRouter from './routes/sparql.js';
import config from '../src/config/config.js'; 

const app = express();
const PORT = config.portAPI;
const API = config.apiPath;

app.use(bodyParser.json());
app.use(`/${API}/sparql`, sparqlRouter);

app.get(`/${API}/status`, (req, res) => {
  res.json({ status: 'OK', message: 'Watr Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
