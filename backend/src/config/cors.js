import { env } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = env.frontendUrl.split(',').map((url) => url.trim());

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
