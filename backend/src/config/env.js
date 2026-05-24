import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '10kb',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not configured. Database calls will fail until backend/.env is set.');
}

if (!env.jwtSecret) {
  console.warn('JWT_SECRET is not configured. Auth token generation will fail until backend/.env is set.');
}

if (!env.openaiApiKey) {
  console.warn('OPENAI_API_KEY is not configured. AI endpoints will fail until backend/.env is set.');
}
