# CampusIQ

CampusIQ is a MERN-based university and academic management platform. It supports student, faculty, and administrator workflows for academic data, attendance, marks, assignments, and notifications.

This release is intentionally **non-ML**. Academic alerts are transparent rule-based summaries only. Machine-learning prediction, model training, Python services, and AI APIs are reserved for a future learning phase.

## Architecture

- `frontend/`: React, React Router, Axios, Tailwind CSS, and Recharts.
- `backend/`: Node.js, Express, Mongoose, JWT, bcryptjs, validation, and REST controllers.
- MongoDB: stores users, profiles, departments, subjects, enrollments, attendance, assessments, marks, assignments, submissions, and notifications.
- Future ML boundary: `backend/src/services/predictionService.js` is reserved for a later Node-to-Python integration. It does not contain a model or prediction implementation now.

The browser calls `/api/...` endpoints through Axios. Express validates and authorizes the request, then Mongoose reads or writes MongoDB. JWTs identify authenticated users and role middleware protects staff and admin operations.

## Features

- Registration and login with JWT authentication.
- Student, faculty, and admin role-based access.
- Student and faculty profiles.
- Department, subject, and enrollment management.
- Attendance records, summaries, trends, and rule-based alerts.
- Assessments, marks, assignments, submissions, and notifications.
- Responsive role-based dashboards with reusable UI components.

## Project Structure

```text
backend/src/
  config/ controllers/ middleware/ models/ routes/
  services/ utils/ validators/ app.js server.js seed.js
frontend/src/
  components/ context/ hooks/ layouts/ pages/ routes/ services/
```

## Local Setup

Requirements: Node.js 18+, MongoDB, and npm.

1. Configure the backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL` in `backend/.env`.

2. Start the backend:

```powershell
cd backend
npm run dev
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

3. Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` to the local backend.

## Development Seed Data

After configuring MongoDB, run:

```powershell
cd backend
npm run seed
```

This creates demo users, one department, one faculty profile, one student profile, one subject, and one enrollment. Credentials are development-only:

- Admin: `admin@campusiq.local` / `Admin@123456`
- Faculty: `faculty@campusiq.local` / `Faculty@123456`
- Student: `student@campusiq.local` / `Student@123456`

Public registration creates student accounts only. Faculty and admin access should be provisioned through controlled administrative workflows.

## API Overview

All API routes are under `/api`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/students/profile`
- `GET /api/faculty/profile`
- `GET /api/departments`
- `GET /api/subjects`
- `GET /api/enrollments`
- `GET /api/attendance`
- `GET /api/assessments`
- `GET /api/marks`
- `GET /api/assignments`
- `GET /api/notifications`

Successful responses use `{ success, message, data }`; errors use `{ success, message }`.

## Roles and Security

- Students can view their own academic data and submit assignments.
- Faculty can manage data for their assigned academic subjects.
- Admins manage users and academic structures.
- Passwords are hashed and excluded from responses.
- JWT authentication, role authorization, request validation, Helmet, CORS, and rate limiting are enabled.

## Deployment

The frontend can be deployed to Vercel. Set `VITE_API_URL` to the backend URL, optionally including `/api`; the frontend normalizes the value. The backend can be deployed to a Node-compatible service such as Render with the variables from `backend/.env.example`. Set `CLIENT_URL` to the frontend origin.

## Testing and Limitations

`npm run build` validates the frontend production bundle. Backend syntax and the current placeholder test command can be run with `node --check` and `npm test`. A fuller automated test suite for authentication, authorization, attendance, marks, and assignments remains future work.

File uploads are not included; submissions currently store a URL or reference. Machine-learning risk prediction is also not included and must be implemented separately after the current MERN application is stable.
