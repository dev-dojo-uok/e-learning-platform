# 🛠️ System Setup Guide

This document describes how to set up the environment, run the database migrations, and run the developer instances for both the **Backend API** and **Frontend Client**.

---

## 📋 System Prerequisites

Ensure you have the following installed on your machine:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **PostgreSQL** Database server (local instance or cloud service like Supabase/Neon)

---

## 🗄️ Step 1: PostgreSQL & Prisma Database Setup

1. **Verify PostgreSQL Connection**: Ensure your Postgres database is running and accessible.
2. **Backend Configuration**: Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
3. **Environment Variables**: Create a `.env` file in the root of the `backend/` folder and insert the following:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>?schema=public"

   # Secret key used to sign JSON Web Tokens (JWT)
   JWT_SECRET="your-jwt-auth-secret-string-here"

   # Frontend Client URL (used to configure CORS)
   FRONTEND_URL="http://localhost:5173"

   # Server Port configuration
   PORT=5000
   ```
4. **Push Database Schema**: Run Prisma's DB Push to generate the database tables defined in `prisma/schema.prisma` directly in your PostgreSQL database:
   ```bash
   npx prisma db push
   ```
5. **Generate Prisma Client**: Run the generator to sync TypeScript/JavaScript client bindings:
   ```bash
   npx prisma generate
   ```

---

## 🔌 Step 2: Running Backend Server

1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Start the development server using `nodemon`:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000` and output detailed logging middleware logs for incoming API requests.

---

## 🎨 Step 3: Frontend Client Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. **Environment Variables**: Create a `.env` file in the root of the `frontend/` folder:
   ```env
   # Endpoint pointing to the Backend API
   VITE_API_URL="http://localhost:5000/api"
   ```
3. Install frontend dependencies (including Tailwind, Shadcn, Zustand, Recharts, and Lucide Icons):
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start running at `http://localhost:5173`.

---

## 🧪 Step 4: Verification

To verify that the system is fully operational:
1. Open `http://localhost:5173` in your browser.
2. Register a new user choosing either **Student** or **Teacher** roles.
3. Upon successful registration, the application will automatically sign you in, save the JWT inside an HttpOnly cookie, initialize the global Zustand store, and redirect you to:
   * **Dashboard Overview** for Teachers/Admins (complete with the premium Shadcn sidebar layout).
   * **My Enrolled Courses** list for Students.
