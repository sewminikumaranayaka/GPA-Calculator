import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler, notFound, requestLogger } from './middleware/index.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.requestBodyLimit }));
app.use(requestLogger);

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
