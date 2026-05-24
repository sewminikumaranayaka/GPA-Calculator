import { query } from '../config/db.js';

export const CourseResult = {
  async findAll() {
    const result = await query(
      `SELECT id, course_name, credits, grade, grade_points, semester, created_at
       FROM course_results
       ORDER BY created_at DESC`,
    );

    return result.rows;
  },

  async create({ courseName, credits, grade, gradePoints, semester }) {
    const result = await query(
      `INSERT INTO course_results (course_name, credits, grade, grade_points, semester)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, course_name, credits, grade, grade_points, semester, created_at`,
      [courseName, credits, grade, gradePoints, semester],
    );

    return result.rows[0];
  },
};
