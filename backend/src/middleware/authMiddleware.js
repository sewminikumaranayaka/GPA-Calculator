import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';

export async function protect(request, _response, next) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401);
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired authentication token', 401));
      return;
    }

    next(error);
  }
}
