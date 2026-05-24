import {
  addCourseResult,
  calculateAcademicSummary,
  listCourseResults,
} from '../services/academicService.js';

export async function getAcademicSummary(_request, response, next) {
  try {
    const summary = await calculateAcademicSummary();
    response.json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getCourseResults(_request, response, next) {
  try {
    const courses = await listCourseResults();
    response.json({ data: courses });
  } catch (error) {
    next(error);
  }
}

export async function createCourseResult(request, response, next) {
  try {
    const course = await addCourseResult(request.body);
    response.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
}
