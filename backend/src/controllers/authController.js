import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import { validateLoginPayload, validateRegisterPayload } from '../utils/validation.js';

export async function registerUser(request, response, next) {
  try {
    validateRegisterPayload(request.body);

    const existingUser = await User.findByEmail(request.body.email);
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await bcrypt.hash(request.body.password, 12);
    const user = await User.create({
      fullName: request.body.fullName.trim(),
      email: request.body.email.trim(),
      passwordHash,
      studentId: request.body.studentId.trim(),
      department: request.body.department.trim(),
      enrollmentYear: Number(request.body.enrollmentYear),
    });

    response.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token: signToken(user.id),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function loginUser(request, response, next) {
  try {
    validateLoginPayload(request.body);

    const user = await User.findByEmail(request.body.email);
    const passwordMatches = user
      ? await bcrypt.compare(request.body.password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      throw new AppError('Invalid email or password', 401);
    }

    const { password_hash: _passwordHash, ...publicUser } = user;

    response.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser,
        token: signToken(user.id),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(request, response) {
  response.json({
    success: true,
    data: {
      user: request.user,
    },
  });
}

function signToken(userId) {
  if (!env.jwtSecret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
