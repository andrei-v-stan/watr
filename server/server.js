import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import uploadRouter from './routes/upload.js';
import filesRouter from './routes/files.js';
import sparqlRouter from './routes/sparql.js';
import config from '../src/config/config.js'; 

const app = express();
const PORT = config.portAPI;
const API = config.apiPath;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(
  session({
    secret: 'watr-fii-miss-standascalu-andrei',
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(bodyParser.json());

app.use(`/${API}/upload`, uploadRouter);
app.use(`/${API}/files`, filesRouter);
app.use(`/${API}/sparql`, sparqlRouter);

app.get(`/${API}/status`, (req, res) => {
  res.json({ status: 'OK', message: 'Watr Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
