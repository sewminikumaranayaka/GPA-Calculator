import { query } from '../config/db.js';

const historyFields = `
  id,
  user_id,
  semester_id,
  semester_gpa,
  cumulative_gpa,
  total_credits,
  completed_credits,
  calculated_at,
  created_at,
  updated_at
`;

const qualifiedHistoryFields = `
  gpa_history.id,
  gpa_history.user_id,
  gpa_history.semester_id,
  gpa_history.semester_gpa,
  gpa_history.cumulative_gpa,
  gpa_history.total_credits,
  gpa_history.completed_credits,
  gpa_history.calculated_at,
  gpa_history.created_at,
  gpa_history.updated_at
`;

export const Gpa = {
  async findSemesterForUser(userId, semesterId) {
    const result = await query(
      `SELECT id, name, academic_year, term_number, start_date, end_date
       FROM semesters
       WHERE id = $1 AND user_id = $2`,
      [semesterId, userId],
    );

    return result.rows[0] || null;
  },

  async findCompletedCoursesForSemester(userId, semesterId) {
    const result = await query(
      `SELECT
         subjects.id AS subject_id,
         subjects.code,
         subjects.title,
         subjects.credits,
         grades.letter_grade,
         grades.grade_points,
         grades.status
       FROM subjects
       INNER JOIN semesters ON semesters.id = subjects.semester_id
       INNER JOIN grades ON grades.subject_id = subjects.id
       WHERE semesters.user_id = $1
         AND semesters.id = $2
         AND grades.status IN ('completed', 'repeated')
       ORDER BY subjects.code ASC`,
      [userId, semesterId],
    );

    return result.rows;
  },

  async findCompletedCoursesThroughSemester(userId, semesterId) {
    const result = await query(
      `WITH target_semester AS (
         SELECT end_date, academic_year, term_number
         FROM semesters
         WHERE id = $2 AND user_id = $1
       )
       SELECT
         subjects.id AS subject_id,
         subjects.code,
         subjects.title,
         subjects.credits,
         grades.letter_grade,
         grades.grade_points,
         grades.status,
         semesters.id AS semester_id,
         semesters.name AS semester_name,
         semesters.academic_year,
         semesters.term_number
       FROM subjects
       INNER JOIN semesters ON semesters.id = subjects.semester_id
       INNER JOIN grades ON grades.subject_id = subjects.id
       CROSS JOIN target_semester
       WHERE semesters.user_id = $1
         AND grades.status IN ('completed', 'repeated')
         AND (
           semesters.end_date <= target_semester.end_date
           OR (
             semesters.academic_year = target_semester.academic_year
             AND semesters.term_number <= target_semester.term_number
           )
         )
       ORDER BY semesters.end_date ASC, semesters.term_number ASC, subjects.code ASC`,
      [userId, semesterId],
    );

    return result.rows;
  },

  async upsertHistory({
    userId,
    semesterId,
    semesterGpa,
    cumulativeGpa,
    totalCredits,
    completedCredits,
  }) {
    const result = await query(
      `INSERT INTO gpa_history (
         user_id,
         semester_id,
         semester_gpa,
         cumulative_gpa,
         total_credits,
         completed_credits,
         calculated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, semester_id)
       DO UPDATE SET
         semester_gpa = EXCLUDED.semester_gpa,
         cumulative_gpa = EXCLUDED.cumulative_gpa,
         total_credits = EXCLUDED.total_credits,
         completed_credits = EXCLUDED.completed_credits,
         calculated_at = NOW(),
         updated_at = NOW()
       RETURNING ${historyFields}`,
      [userId, semesterId, semesterGpa, cumulativeGpa, totalCredits, completedCredits],
    );

    return result.rows[0];
  },

  async findHistoryByUser(userId) {
    const result = await query(
      `SELECT
         ${qualifiedHistoryFields},
         semesters.name AS semester_name,
         semesters.academic_year,
         semesters.term_number
       FROM gpa_history
       INNER JOIN semesters ON semesters.id = gpa_history.semester_id
       WHERE gpa_history.user_id = $1
       ORDER BY semesters.end_date ASC, semesters.term_number ASC`,
      [userId],
    );

    return result.rows;
  },
};
