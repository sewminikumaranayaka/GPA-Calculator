# AI Academic Performance & GPA Intelligence System

A scalable full-stack portfolio project for tracking academic performance, calculating GPA, and preparing future AI-powered insights such as grade prediction, risk alerts, and study recommendations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Architecture: separated frontend/backend apps with service, controller, route, and configuration layers

## Folder Structure

```text
AI Academic Performance & GPA Intelligence System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Getting Started

### 1. Install Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 14+

### 2. Install Dependencies

```bash
npm install
npm run install:all
```

### 3. Configure Backend Environment

Create `backend/.env` from the example file:

```bash
cp backend/.env.example backend/.env
```

Update the PostgreSQL connection values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/gpa_intelligence
FRONTEND_URL=http://localhost:5173
```

### 4. Create PostgreSQL Database

```sql
CREATE DATABASE gpa_intelligence;
```

The backend includes an initial schema helper in `backend/src/models/schema.sql`.

### 5. Run The Project

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Available Scripts

Root scripts:

- `npm run install:all` installs frontend and backend dependencies.
- `npm run dev` runs frontend and backend together.
- `npm run dev:frontend` runs only the frontend.
- `npm run dev:backend` runs only the backend.
- `npm run build` builds the frontend.
- `npm start` starts the backend in production mode.

## Portfolio Expansion Ideas

- User authentication and role-based dashboards
- Semester and transcript import
- AI-powered GPA forecasting
- Academic risk detection
- Course recommendation engine
- Admin analytics dashboard
- PDF report generation
