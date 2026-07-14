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
