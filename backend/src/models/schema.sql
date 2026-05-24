CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS study_recommendations;
DROP TABLE IF EXISTS gpa_history;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(120) NOT NULL CHECK (length(trim(full_name)) >= 2),
  email VARCHAR(160) NOT NULL UNIQUE CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  password_hash TEXT NOT NULL,
  student_id VARCHAR(40) NOT NULL UNIQUE,
  department VARCHAR(120) NOT NULL,
  enrollment_year INTEGER NOT NULL CHECK (enrollment_year BETWEEN 1990 AND 2100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  academic_year VARCHAR(20) NOT NULL CHECK (academic_year ~ '^[0-9]{4}/[0-9]{4}$'),
  term_number INTEGER NOT NULL CHECK (term_number BETWEEN 1 AND 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT semesters_valid_date_range CHECK (end_date > start_date),
  CONSTRAINT semesters_unique_user_term UNIQUE (user_id, academic_year, term_number)
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  title VARCHAR(160) NOT NULL CHECK (length(trim(title)) >= 3),
  credits NUMERIC(4, 1) NOT NULL CHECK (credits > 0 AND credits <= 10),
  subject_type VARCHAR(30) NOT NULL DEFAULT 'core'
    CHECK (subject_type IN ('core', 'elective', 'lab', 'project', 'general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subjects_unique_semester_code UNIQUE (semester_id, code)
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL UNIQUE REFERENCES subjects(id) ON DELETE CASCADE,
  letter_grade VARCHAR(3) NOT NULL
    CHECK (letter_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F')),
  grade_points NUMERIC(3, 2) NOT NULL CHECK (grade_points >= 0 AND grade_points <= 4),
  marks NUMERIC(5, 2) CHECK (marks >= 0 AND marks <= 100),
  status VARCHAR(20) NOT NULL DEFAULT 'completed'
    CHECK (status IN ('in_progress', 'completed', 'repeated', 'withdrawn')),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gpa_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  semester_gpa NUMERIC(3, 2) NOT NULL CHECK (semester_gpa >= 0 AND semester_gpa <= 4),
  cumulative_gpa NUMERIC(3, 2) NOT NULL CHECK (cumulative_gpa >= 0 AND cumulative_gpa <= 4),
  total_credits NUMERIC(5, 1) NOT NULL CHECK (total_credits >= 0),
  completed_credits NUMERIC(5, 1) NOT NULL CHECK (completed_credits >= 0),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT gpa_history_completed_not_over_total CHECK (completed_credits <= total_credits),
  CONSTRAINT gpa_history_unique_user_semester UNIQUE (user_id, semester_id)
);

CREATE TABLE study_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  recommendation_type VARCHAR(40) NOT NULL
    CHECK (recommendation_type IN ('study_plan', 'risk_alert', 'grade_improvement', 'time_management', 'resource')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(160) NOT NULL,
  recommendation TEXT NOT NULL CHECK (length(trim(recommendation)) >= 10),
  confidence_score NUMERIC(4, 3) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_semesters_user_id ON semesters(user_id);
CREATE INDEX idx_subjects_semester_id ON subjects(semester_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_gpa_history_user_id ON gpa_history(user_id);
CREATE INDEX idx_recommendations_user_id ON study_recommendations(user_id);
CREATE INDEX idx_recommendations_subject_id ON study_recommendations(subject_id);
CREATE INDEX idx_recommendations_priority ON study_recommendations(priority);

INSERT INTO users (id, full_name, email, password_hash, student_id, department, enrollment_year)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Avery Johnson', 'avery.johnson@example.edu', '$2a$10$XqZYoEFi9AMpS38vSusZBejcCH1kn7mLVfdPvHX5FSnKV5VxIFq8S', 'STU-2024-001', 'Computer Science', 2024),
  ('22222222-2222-2222-2222-222222222222', 'Maya Fernando', 'maya.fernando@example.edu', '$2a$10$XqZYoEFi9AMpS38vSusZBejcCH1kn7mLVfdPvHX5FSnKV5VxIFq8S', 'STU-2024-002', 'Data Science', 2024);

INSERT INTO semesters (id, user_id, name, academic_year, term_number, start_date, end_date)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Year 1 Semester 1', '2024/2025', 1, '2024-09-01', '2024-12-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Year 1 Semester 2', '2024/2025', 2, '2025-01-15', '2025-05-15'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'Year 1 Semester 1', '2024/2025', 1, '2024-09-01', '2024-12-20');

INSERT INTO subjects (id, semester_id, code, title, credits, subject_type)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'CS101', 'Programming Fundamentals', 3.0, 'core'),
  ('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'MATH101', 'Discrete Mathematics', 3.0, 'core'),
  ('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'STAT101', 'Statistics for Computing', 4.0, 'core'),
  ('c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'CS201', 'Data Structures and Algorithms', 3.0, 'core'),
  ('c5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'DB201', 'Database Systems', 3.0, 'core'),
  ('d1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'DS101', 'Introduction to Data Science', 3.0, 'core'),
  ('d2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'MATH120', 'Linear Algebra', 3.0, 'core');

INSERT INTO grades (subject_id, letter_grade, grade_points, marks, status, graded_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'A', 4.00, 88.50, 'completed', '2024-12-22 10:00:00+00'),
  ('c2222222-2222-2222-2222-222222222222', 'B+', 3.30, 79.00, 'completed', '2024-12-22 10:00:00+00'),
  ('c3333333-3333-3333-3333-333333333333', 'A-', 3.70, 84.00, 'completed', '2024-12-22 10:00:00+00'),
  ('c4444444-4444-4444-4444-444444444444', 'B', 3.00, 74.00, 'completed', '2025-05-18 10:00:00+00'),
  ('c5555555-5555-5555-5555-555555555555', 'A', 4.00, 91.00, 'completed', '2025-05-18 10:00:00+00'),
  ('d1111111-1111-1111-1111-111111111111', 'A-', 3.70, 85.00, 'completed', '2024-12-22 10:00:00+00'),
  ('d2222222-2222-2222-2222-222222222222', 'C+', 2.30, 68.00, 'completed', '2024-12-22 10:00:00+00');

INSERT INTO gpa_history (
  user_id,
  semester_id,
  semester_gpa,
  cumulative_gpa,
  total_credits,
  completed_credits,
  calculated_at
)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 3.68, 3.68, 10.0, 10.0, '2024-12-23 08:00:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 3.50, 3.61, 16.0, 16.0, '2025-05-19 08:00:00+00'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 3.00, 3.00, 6.0, 6.0, '2024-12-23 08:00:00+00');

INSERT INTO study_recommendations (
  user_id,
  subject_id,
  recommendation_type,
  priority,
  title,
  recommendation,
  confidence_score,
  status
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'c4444444-4444-4444-4444-444444444444',
    'grade_improvement',
    'medium',
    'Strengthen algorithm practice',
    'Schedule three weekly problem-solving sessions focused on recursion, sorting, and graph traversal.',
    0.820,
    'active'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'c5555555-5555-5555-5555-555555555555',
    'resource',
    'low',
    'Maintain database performance',
    'Continue using query practice sets and add weekly SQL optimization review before assessments.',
    0.740,
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'd2222222-2222-2222-2222-222222222222',
    'risk_alert',
    'high',
    'Improve linear algebra foundation',
    'Prioritize matrix operations, vector spaces, and eigenvalue exercises before the next mathematics module.',
    0.910,
    'active'
  );
