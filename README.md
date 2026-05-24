# GPA Intelligence - AI Academic Performance Platform

GPA Intelligence is a full-stack academic analytics application built to help students calculate GPA, understand performance trends, plan target outcomes, and generate AI-assisted study recommendations. It combines a React dashboard, an Express API, PostgreSQL data modeling, OpenAI-powered insights, and downloadable PDF reports into one polished portfolio project.

This project is designed as an internship-ready demonstration of practical full-stack engineering: clean UI composition, REST API design, validation, authentication structure, AI integration, data visualization, report generation, and production-minded project organization.

## Features

- **Interactive academic dashboard** with GPA metrics, credit totals, subject performance, weak subject highlights, and trend charts.
- **Semester GPA calculator** with grade validation, weighted GPA calculation, and shared academic state across the frontend.
- **Cumulative GPA and target planning** to show required future semester performance and course-level grade targets.
- **GPA prediction workflow** for forecasting semester and cumulative outcomes from planned courses.
- **AI performance analysis** using OpenAI structured responses for strengths, risks, academic insights, and study recommendations.
- **AI-powered study recommendation engine** that ranks weak subjects, assigns study priorities, creates a weekly plan, and recommends personalized actions.
- **PDF GPA report export** with summary metrics, course table, charts, AI insights, and recommendations.
- **Dark mode** with Tailwind class-based theming, header toggle, localStorage persistence, and smooth transitions.
- **Authentication-ready backend** with registration, login, JWT middleware, and protected academic routes.
- **PostgreSQL schema** for users, semesters, subjects, grades, GPA history, and study recommendations.
- **Responsive interface** built for desktop and mobile academic workflows.

## Screenshots

Add screenshots to `docs/screenshots/` and update these links when preparing the GitHub repository.

| Dashboard | GPA Calculator | AI Analysis |
| --- | --- | --- |
| `docs/screenshots/dashboard.png` | `docs/screenshots/gpa-calculator.png` | `docs/screenshots/ai-analysis.png` |

| Study Recommendations | Dark Mode | PDF Report |
| --- | --- | --- |
| `docs/screenshots/study-recommendations.png` | `docs/screenshots/dark-mode.png` | `docs/screenshots/pdf-report.png` |

## Tech Stack

**Frontend**

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React
- `@react-pdf/renderer`

**Backend**

- Node.js 20+
- Express
- PostgreSQL
- OpenAI SDK
- JWT authentication
- bcrypt
- Helmet, CORS, Morgan
- ESLint

**Architecture**

- Separate `frontend` and `backend` applications
- REST API with route, controller, service, model, middleware, and config layers
- Shared frontend context for academic data and theme state
- Structured OpenAI JSON responses for predictable AI features

## Project Structure

```text
GPA Calculator/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |-- index.html
|   |-- package.json
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- package.json
`-- README.md
```

## Installation Guide

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+
- OpenAI API key for AI analysis endpoints

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "GPA Calculator"
```

### 2. Install Dependencies

```bash
npm install
npm run install:all
```

### 3. Configure Environment Variables

Create a backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update the values in `backend/.env` for your local database and API keys.

### 4. Create the Database

```sql
CREATE DATABASE gpa_intelligence;
```

Apply the provided schema:

```bash
psql -U postgres -d gpa_intelligence -f backend/src/models/schema.sql
```

### 5. Run the Application

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## API Setup

The backend exposes REST endpoints under `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Backend health check |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth/me` | Get authenticated user profile |
| `GET` | `/api/academics/summary` | Get academic summary |
| `GET` | `/api/academics/courses` | Get course results |
| `POST` | `/api/academics/courses` | Create a course result |
| `POST` | `/api/gpa/semester` | Calculate semester GPA |
| `POST` | `/api/gpa/cumulative` | Calculate cumulative GPA |
| `GET` | `/api/gpa/history` | Get saved GPA history |
| `POST` | `/api/gpa/history` | Save GPA history |
| `POST` | `/api/ai/analysis` | Generate full AI academic analysis |
| `POST` | `/api/ai/performance-analysis` | Generate AI performance summary |
| `POST` | `/api/ai/weak-subjects` | Detect weak subjects |
| `POST` | `/api/ai/academic-insights` | Generate academic insights |
| `POST` | `/api/ai/study-recommendations` | Generate AI study recommendations |
| `POST` | `/api/predictions/gpa` | Predict future GPA |
| `POST` | `/api/planner/target-gpa` | Build a target GPA plan |
| `POST` | `/api/recommendations/study-plan` | Generate weekly study recommendation plan |

Example GPA request:

```json
{
  "courses": [
    {
      "courseName": "Data Structures",
      "credits": 3,
      "grade": "A",
      "gradePoints": 4
    },
    {
      "courseName": "Statistics",
      "credits": 4,
      "grade": "B+",
      "gradePoints": 3.3
    }
  ]
}
```

## Environment Variables

Create `backend/.env` with the following values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa_intelligence
FRONTEND_URL=http://localhost:5173
REQUEST_BODY_LIMIT=10kb
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=replace_with_your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
```

Variable notes:

- `DATABASE_URL` connects the Express API to PostgreSQL.
- `FRONTEND_URL` is used by CORS to allow the Vite development server.
- `JWT_SECRET` signs authentication tokens.
- `OPENAI_API_KEY` enables AI analysis and recommendation endpoints.
- `OPENAI_MODEL` controls which OpenAI model the backend uses for structured AI responses.

## Available Scripts

Root scripts:

```bash
npm run install:all
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm start
```

Frontend scripts:

```bash
npm run dev --prefix frontend
npm run build --prefix frontend
npm run lint --prefix frontend
```

Backend scripts:

```bash
npm run dev --prefix backend
npm start --prefix backend
npm run lint --prefix backend
```

## Why This Project Is Internship-Ready

- Demonstrates full-stack feature delivery across frontend, backend, database, and AI layers.
- Uses maintainable folder structure with clear separation of concerns.
- Shows practical UI engineering with charts, forms, responsive layouts, dark mode, and PDF export.
- Includes API validation, error handling, middleware, authentication foundations, and service-based business logic.
- Uses structured AI responses rather than free-form text, making AI output easier to consume safely in the UI.
- Provides realistic academic workflows that can be explained clearly in interviews.

## Future Improvements

- Add automated test coverage with Vitest, React Testing Library, and backend integration tests.
- Add full user-specific persistence for dashboard state, GPA plans, predictions, and exported reports.
- Add screenshot assets and a hosted demo link.
- Add refresh-token authentication and role-based access for students, advisors, and admins.
- Add transcript import from CSV/PDF.
- Add notifications for academic risk alerts and upcoming study-plan checkpoints.
- Add code splitting for the PDF export bundle to reduce the initial frontend chunk size.
- Add Docker Compose for PostgreSQL, backend, and frontend development.
- Add CI workflow for linting, builds, and database migration checks.

## License

This project is intended for portfolio and internship application use. Add a license file before publishing if you want to define reuse terms.
