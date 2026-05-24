import { Gpa } from '../models/gpaModel.js';
import { AppError } from '../utils/AppError.js';
import {
  validateCumulativeGpaPayload,
  validateSemesterGpaPayload,
  validateSemesterIdPayload,
} from '../utils/validation.js';

export function calculateSemesterGpa(payload) {
  validateSemesterGpaPayload(payload);

  return summarizeCourses(payload.courses);
}

export function calculateCumulativeGpa(payload) {
  validateCumulativeGpaPayload(payload);

  const semesterSummaries = payload.semesters.map((semester) => ({
    semesterId: semester.semesterId || null,
    semesterName: semester.semesterName || semester.name || null,
    ...summarizeCourses(semester.courses),
  }));

  const allCourses = payload.semesters.flatMap((semester) => semester.courses);
  const cumulative = summarizeCourses(allCourses);

  return {
    ...cumulative,
    semesters: semesterSummaries,
  };
}

export async function calculateStoredSemesterGpa(userId, semesterId) {
  validateSemesterIdPayload({ semesterId });
  await ensureSemesterBelongsToUser(userId, semesterId);

  const courses = await Gpa.findCompletedCoursesForSemester(userId, semesterId);
  if (courses.length === 0) {
    throw new AppError('No completed graded courses found for this semester', 404);
  }

  return {
    semesterId,
    ...summarizeCourses(courses),
    courses,
  };
}

export async function calculateStoredCumulativeGpa(userId, semesterId) {
  validateSemesterIdPayload({ semesterId });
  await ensureSemesterBelongsToUser(userId, semesterId);

  const courses = await Gpa.findCompletedCoursesThroughSemester(userId, semesterId);
  if (courses.length === 0) {
    throw new AppError('No completed graded courses found for this cumulative GPA', 404);
  }

  return {
    semesterId,
    ...summarizeCourses(courses),
    courses,
  };
}

export async function saveGpaHistory(userId, payload) {
  validateSemesterIdPayload(payload);

  const semesterSummary = await calculateStoredSemesterGpa(userId, payload.semesterId);
  const cumulativeSummary = await calculateStoredCumulativeGpa(userId, payload.semesterId);

  const history = await Gpa.upsertHistory({
    userId,
    semesterId: payload.semesterId,
    semesterGpa: semesterSummary.gpa,
    cumulativeGpa: cumulativeSummary.gpa,
    totalCredits: cumulativeSummary.totalCredits,
    completedCredits: cumulativeSummary.totalCredits,
  });

  return {
    history,
    semester: semesterSummary,
    cumulative: cumulativeSummary,
  };
}

export async function listGpaHistory(userId) {
  return Gpa.findHistoryByUser(userId);
}

function summarizeCourses(courses) {
  const totals = courses.reduce(
    (summary, course) => {
      const credits = Number(course.credits);
      const gradePoints = Number(course.gradePoints ?? course.grade_points);

      return {
        totalCredits: summary.totalCredits + credits,
        weightedPoints: summary.weightedPoints + credits * gradePoints,
      };
    },
    { totalCredits: 0, weightedPoints: 0 },
  );

  const gpa = totals.totalCredits ? roundGpa(totals.weightedPoints / totals.totalCredits) : 0;

  return {
    gpa,
    totalCredits: roundCredits(totals.totalCredits),
    qualityPoints: roundCredits(totals.weightedPoints),
    courseCount: courses.length,
  };
}

async function ensureSemesterBelongsToUser(userId, semesterId) {
  const semester = await Gpa.findSemesterForUser(userId, semesterId);

  if (!semester) {
    throw new AppError('Semester not found', 404);
  }

  return semester;
}

function roundGpa(value) {
  return Number(value.toFixed(2));
}

function roundCredits(value) {
  return Number(value.toFixed(1));
}
