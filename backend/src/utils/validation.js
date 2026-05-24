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

export function validateSemesterGpaPayload(payload) {
  const errors = {};

  if (!Array.isArray(payload.courses) || payload.courses.length === 0) {
    errors.courses = 'At least one course is required.';
  } else {
    payload.courses.forEach((course, index) => {
      validateCourseForGpa(course, index, errors);
    });
  }

  throwIfValidationErrors(errors);
}

export function validateCumulativeGpaPayload(payload) {
  const errors = {};

  if (!Array.isArray(payload.semesters) || payload.semesters.length === 0) {
    errors.semesters = 'At least one semester is required.';
  } else {
    payload.semesters.forEach((semester, semesterIndex) => {
      if (!Array.isArray(semester.courses) || semester.courses.length === 0) {
        errors[`semesters.${semesterIndex}.courses`] = 'At least one course is required.';
        return;
      }

      semester.courses.forEach((course, courseIndex) => {
        validateCourseForGpa(course, `semesters.${semesterIndex}.courses.${courseIndex}`, errors);
      });
    });
  }

  throwIfValidationErrors(errors);
}

export function validateSemesterIdPayload(payload) {
  const errors = {};

  if (!payload.semesterId || typeof payload.semesterId !== 'string') {
    errors.semesterId = 'Semester ID is required.';
  }

  throwIfValidationErrors(errors);
}

function validateCourseForGpa(course, index, errors) {
  const credits = Number(course?.credits);
  const gradePoints = Number(course?.gradePoints ?? course?.grade_points);
  const keyPrefix = typeof index === 'number' ? `courses.${index}` : index;

  if (!Number.isFinite(credits) || credits <= 0 || credits > 10) {
    errors[`${keyPrefix}.credits`] = 'Credits must be greater than 0 and no more than 10.';
  }

  if (!Number.isFinite(gradePoints) || gradePoints < 0 || gradePoints > 4) {
    errors[`${keyPrefix}.gradePoints`] = 'Grade points must be between 0 and 4.';
  }
}

function throwIfValidationErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
}
