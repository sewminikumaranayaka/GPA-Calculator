import { AppError } from './AppError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterPayload(payload) {
  const errors = {};

  if (!payload.fullName || payload.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!payload.email || !emailPattern.test(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (!payload.password || payload.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!payload.studentId || payload.studentId.trim().length < 3) {
    errors.studentId = 'Student ID is required.';
  }

  if (!payload.department || payload.department.trim().length < 2) {
    errors.department = 'Department is required.';
  }

  const enrollmentYear = Number(payload.enrollmentYear);
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 1990 || enrollmentYear > 2100) {
    errors.enrollmentYear = 'Enrollment year must be between 1990 and 2100.';
  }

  throwIfValidationErrors(errors);
}

export function validateLoginPayload(payload) {
  const errors = {};

  if (!payload.email || !emailPattern.test(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (!payload.password) {
    errors.password = 'Password is required.';
  }

  throwIfValidationErrors(errors);
}

function throwIfValidationErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
}
