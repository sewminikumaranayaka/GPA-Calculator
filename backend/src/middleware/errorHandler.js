import { env } from '../config/env.js';

export function errorHandler(error, _request, response, _next) {
  const normalizedError = normalizeError(error);

  response.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    errors: normalizedError.errors || undefined,
    stack: env.nodeEnv === 'production' ? undefined : error.stack,
  });
}

function normalizeError(error) {
  if (error.code === '23505') {
    return {
      statusCode: 409,
      message: 'Resource already exists',
      errors: { constraint: error.constraint },
    };
  }

  if (error.code === '23514') {
    return {
      statusCode: 400,
      message: 'Validation failed',
      errors: { constraint: error.constraint },
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal server error',
    errors: error.errors,
  };
}
