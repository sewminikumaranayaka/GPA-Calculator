import { generatePredictionExplanation } from './aiService.js';
import { AppError } from '../utils/AppError.js';

const gradeScale = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0,
};

export async function predictGpa(payload) {
  const normalized = normalizePredictionPayload(payload);
  const semester = summarizeCourses(normalized.futureCourses);
  const completedQualityPoints = normalized.currentCumulativeGpa * normalized.completedCredits;
  const cumulativeCredits = normalized.completedCredits + semester.totalCredits;
  const cumulativeQualityPoints = completedQualityPoints + semester.qualityPoints;
  const cumulativeGpa = cumulativeCredits ? roundGpa(cumulativeQualityPoints / cumulativeCredits) : semester.gpa;

  const prediction = {
    currentCumulativeGpa: normalized.currentCumulativeGpa,
    completedCredits: normalized.completedCredits,
    predictedSemesterGpa: semester.gpa,
    predictedCumulativeGpa: cumulativeGpa,
    futureCredits: semester.totalCredits,
    futureQualityPoints: semester.qualityPoints,
    cumulativeCredits: roundCredits(cumulativeCredits),
    cumulativeQualityPoints: roundCredits(cumulativeQualityPoints),
    futureCourses: normalized.futureCourses,
  };

  const explanation = await generatePredictionExplanation(prediction);

  return {
    ...prediction,
    explanation,
  };
}

function normalizePredictionPayload(payload) {
  const errors = {};
  const currentCumulativeGpa = Number(payload?.currentCumulativeGpa);
  const completedCredits = Number(payload?.completedCredits);
  const futureCourses = Array.isArray(payload?.futureCourses) ? payload.futureCourses : [];

  if (!Number.isFinite(currentCumulativeGpa) || currentCumulativeGpa < 0 || currentCumulativeGpa > 4) {
    errors.currentCumulativeGpa = 'Current cumulative GPA must be between 0 and 4.';
  }

  if (!Number.isFinite(completedCredits) || completedCredits < 0) {
    errors.completedCredits = 'Completed credits must be 0 or greater.';
  }

  if (futureCourses.length === 0) {
    errors.futureCourses = 'At least one future course is required.';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  return {
    currentCumulativeGpa,
    completedCredits,
    futureCourses: futureCourses.map(normalizeFutureCourse),
  };
}

function normalizeFutureCourse(course, index) {
  const name = String(course?.name || course?.courseName || `Future Course ${index + 1}`).trim();
  const credits = Number(course?.credits);
  const expectedGrade = String(course?.expectedGrade || course?.grade || 'A').trim();
  const expectedGradePoints = Number(course?.expectedGradePoints ?? course?.gradePoints ?? gradeScale[expectedGrade]);
  const errors = {};

  if (!name) {
    errors.name = 'Course name is required.';
  }

  if (!Number.isFinite(credits) || credits <= 0 || credits > 10) {
    errors.credits = 'Credits must be greater than 0 and no more than 10.';
  }

  if (!Number.isFinite(expectedGradePoints) || expectedGradePoints < 0 || expectedGradePoints > 4) {
    errors.expectedGradePoints = 'Expected grade points must be between 0 and 4.';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(`Invalid future course at index ${index}`, 400, errors);
  }

  return {
    name,
    credits,
    expectedGrade,
    expectedGradePoints,
  };
}

function summarizeCourses(courses) {
  const totals = courses.reduce(
    (summary, course) => ({
      totalCredits: summary.totalCredits + course.credits,
      qualityPoints: summary.qualityPoints + course.credits * course.expectedGradePoints,
    }),
    { totalCredits: 0, qualityPoints: 0 },
  );

  return {
    gpa: totals.totalCredits ? roundGpa(totals.qualityPoints / totals.totalCredits) : 0,
    totalCredits: roundCredits(totals.totalCredits),
    qualityPoints: roundCredits(totals.qualityPoints),
  };
}

function roundGpa(value) {
  return Number(value.toFixed(2));
}

function roundCredits(value) {
  return Number(value.toFixed(1));
}
