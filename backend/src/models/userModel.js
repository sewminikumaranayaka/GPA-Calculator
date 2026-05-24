import { query } from '../config/db.js';

const publicUserFields = `
  id,
  full_name,
  email,
  student_id,
  department,
  enrollment_year,
  created_at,
  updated_at
`;

export const User = {
  async create({ fullName, email, passwordHash, studentId, department, enrollmentYear }) {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, student_id, department, enrollment_year)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${publicUserFields}`,
      [fullName, email.toLowerCase(), passwordHash, studentId, department, enrollmentYear],
    );

    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      `SELECT id, full_name, email, password_hash, student_id, department, enrollment_year, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()],
    );

    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      `SELECT ${publicUserFields}
       FROM users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] || null;
  },
};
