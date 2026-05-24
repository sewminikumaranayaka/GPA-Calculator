import { CourseResult } from '../models/courseResultModel.js';
import { AppError } from '../utils/AppError.js';

export async function listCourseResults() {
  return CourseResult.findAll();
}

export async function addCourseResult(payload) {
  const requiredFields = ['courseName', 'credits', 'grade', 'gradePoints'];
  const missingField = requiredFields.find((field) => payload[field] === undefined || payload[field] === '');

  if (missingField) {
    throw new AppError(`Missing required field: ${missingField}`, 400);
  }

  return CourseResult.create({
    courseName: payload.courseName,
    credits: Number(payload.credits),
    grade: payload.grade,
    gradePoints: Number(payload.gradePoints),
    semester: payload.semester || null,
  });
}

export async function calculateAcademicSummary() {
  const courses = await CourseResult.findAll();
  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
  const weightedPoints = courses.reduce(
    (sum, course) => sum + Number(course.credits) * Number(course.grade_points),
    0,
  );

  return {
    totalCourses: courses.length,
    totalCredits,
    gpa: totalCredits ? Number((weightedPoints / totalCredits).toFixed(2)) : 0,
  };
}
