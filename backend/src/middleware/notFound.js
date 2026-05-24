import { AppError } from '../utils/AppError.js';

export function notFound(request, _response, next) {
  next(new AppError(`Route not found: ${request.originalUrl}`, 404));
}
