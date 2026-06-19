# 🎓 E-Learning Platform (PERN Stack)

This repository contains the full architecture, frontend, and backend implementation for the group's E-Learning Platform. The system is built around a **Clean Layered (3-Tier) Monolithic Architecture** and is organized to allow exactly 5 group members to develop distinct features in isolated folders.

---

## 🏗️ Architecture Layout

The codebase separates concerns between presentation, business logic, and database access:

```text
e-learning-platform/
│
├── frontend/                       # LAYER 1: PRESENTATION LAYER (React + Tailwind v4 + Vite)
│   ├── src/
│   │   ├── components/             # Shared layout elements (Sidebar, Loader, Headers)
│   │   ├── store/                  # Global Zustand stores (Session & auth state)
│   │   └── modules/                # Feature modules
│   │       ├── courses/            # <-- Member 1 (Course Shell & Material Viewer)
│   │       ├── quizzes/            # <-- Member 2 (Quiz Activities)
│   │       ├── forums/             # <-- Member 3 (Forums & Threads)
│   │       ├── completion/         # <-- Member 4 (Progress Analytics)
│   │       └── assignments/        # <-- Member 5 (Dropbox & Grading)
│
├── backend/                        # LAYERS 2 & 3: BUSINESS LOGIC & DATA ACCESS (Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma           # Relational Postgres database schema for all members
│   └── src/
│       ├── config/                 # DB connections & Auth middlewares
│       └── modules/                # Backend API Routers
│           ├── auth/               # Shared Login & Registration
│           ├── courses/            # <-- Member 1 Backend
│           ├── quizzes/            # <-- Member 2 Backend
│           ├── forums/             # <-- Member 3 Backend
│           ├── completion/         # <-- Member 4 Backend
│           └── assignments/        # <-- Member 5 Backend
```

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS (v4), Zustand (State), Recharts, Lucide React (Icons)
* **Backend**: Node.js, Express.js with Cookie-Parser and Logging Middleware
* **Database**: PostgreSQL with Prisma ORM
* **Authentication**: JSON Web Tokens (JWT) signed on registration/login and transmitted via HTTP-only Cookies

---

## 🚀 Guides and Resources

Before you start writing code, please review the following files:

* **[setup.md](setup.md)**: Steps to configure environment variables, setup the PostgreSQL database using Prisma, and start development servers.
* **[contribution-guide.md](contribution-guide.md)**: Coding conventions, path aliases (`@/`), directory ownership, global Zustand state guides, and database migration instructions.

---

## 👥 Group Features Assignment

* **Member 01**: Course Shell & Material Management Engine (PDF, File, Video Embed, Video Src)
* **Member 02**: Quiz Material Activity, Form-based assessments, Grading logic, timers
* **Member 03**: Course Discussion Board & Module Forums
* **Member 04**: Student Completion Tracking, completion state engine, analytics graphs
* **Member 05**: Assignment Dropbox & Student Submission / Teacher Grading dashboard

---

## 📦 Member 01 — Course Shell & Material Management Engine

### ✅ Implementation Status

| Feature | Status |
|---|---|
| Course CRUD APIs | ✅ Completed |
| CourseModule CRUD APIs | ✅ Completed |
| Material APIs | 🔲 Pending |

---

### 🗂️ CourseModule CRUD — Folder Structure

```text
backend/src/modules/modules/
├── routes/
│   └── module.routes.js        ← Express Router with auth & validation middleware
├── controllers/
│   └── module.controller.js    ← HTTP request/response handling only
├── services/
│   └── module.service.js       ← All Prisma queries & business logic
├── validations/
│   └── module.validation.js    ← express-validator rules
└── index.js                    ← Barrel re-export
```

> **Note:** The underlying Prisma model is `CourseSection` (as defined in `schema.prisma`). The API is exposed at `/api/modules`.

---

### 🌐 CourseModule REST API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/modules` | ✅ TEACHER / ADMIN | Create a new course module |
| `GET` | `/api/modules/course/:courseId` | ❌ Public | Get all modules for a course (sorted) |
| `PUT` | `/api/modules/:id` | ✅ TEACHER / ADMIN | Update a module's title or sort order |
| `DELETE` | `/api/modules/:id` | ✅ TEACHER / ADMIN | Delete a module (cascades to materials) |

---

### 📋 API Usage Examples

#### 1. Create Course Module — `POST /api/modules`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Introduction to Database",
  "sortOrder": 1
}
```

**Response `201 Created`:**
```json
{
  "id": "f9e8d7c6-b5a4-3210-fedc-ba9876543210",
  "courseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Introduction to Database",
  "sortOrder": 1,
  "createdAt": "2026-06-19T11:00:00.000Z",
  "updatedAt": "2026-06-19T11:00:00.000Z",
  "course": { "id": "a1b2c3d4-...", "title": "Database Systems" }
}
```

---

#### 2. Get Modules By Course — `GET /api/modules/course/:courseId`

**URL:** `GET /api/modules/course/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Response `200 OK`:**
```json
[
  { "id": "...", "courseId": "...", "title": "Introduction to Database", "sortOrder": 1 },
  { "id": "...", "courseId": "...", "title": "SQL Fundamentals", "sortOrder": 2 }
]
```

> Returns `404` if the course does not exist.

---

#### 3. Update Course Module — `PUT /api/modules/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (partial update supported):**
```json
{
  "title": "Updated Module Title",
  "sortOrder": 2
}
```

**Response `200 OK`:**
```json
{
  "id": "f9e8d7c6-b5a4-3210-fedc-ba9876543210",
  "title": "Updated Module Title",
  "sortOrder": 2
}
```

---

#### 4. Delete Course Module — `DELETE /api/modules/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response `200 OK`:**
```json
{ "message": "Course module deleted successfully." }
```

> Deleting a module automatically removes all its related `Material` records via **cascade delete** defined in `schema.prisma`.

---

### ⚠️ Validation Rules

| Field | Rule |
|---|---|
| `courseId` | Required, valid UUID |
| `title` | Required (create), string, max 255 chars |
| `sortOrder` | Required (create), non-negative integer |
| `:id` / `:courseId` params | Valid UUID |

---

### 🔗 Route Registration in `src/index.js`

```js
import moduleRoutes from './modules/modules/index.js';
// ...
app.use('/api/modules', moduleRoutes);
```
