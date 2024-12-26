import express from 'express';
import cors from 'cors';

import visualizeRoutes from './routes/visualizeRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import sparqlQueryRoutes from './routes/sparqlQueryRoutes.js';
// import classifyRoutes from './routes/classifyRoutes.js';
// import compareRoutes from './routes/compareRoutes.js';
// import matchRoutes from './routes/matchRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/visualize', visualizeRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/sparql', sparqlQueryRoutes);
// app.use('/api/classify', classifyRoutes);
// app.use('/api/compare', compareRoutes);
// app.use('/api/match', matchRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
