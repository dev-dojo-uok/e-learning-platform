# 🤝 Contribution & Collaboration Guide

To maintain a clean codebase and avoid branch conflicts, we follow a strict multi-member module design pattern. This document outlines how to implement features, share states, and manage database schema modifications.

---

## 📂 Directory Layout and Folder Ownership

This project is modularized so each group member works in their designated folders:

### Frontend Layout (`frontend/src/modules/`)
* **Shared Space**: Common layouts, routing configs, stores, and shared UI components are located in `src/components/`, `src/store/`, and `src/hooks/`.
* **Isolated Modules**:
  * `modules/courses/` — **Member 1** (Course Shell & Material Engine)
  * `modules/quizzes/` — **Member 2** (Quiz Activities & Forms)
  * `modules/forums/` — **Member 3** (Discussion Boards & Threads)
  * `modules/completion/` — **Member 4** (Progress Analytics & Completion logic)
  * `modules/assignments/` — **Member 5** (Dropbox & Submissions)

### Backend Layout (`backend/src/modules/`)
* **Shared Space**: Database configuration (`src/config/db.js`), Shared Authentication (`src/modules/auth/`).
* **Isolated Modules**:
  * `modules/courses/` — **Member 1 Backend**
  * `modules/quizzes/` — **Member 2 Backend**
  * `modules/forums/` — **Member 3 Backend**
  * `modules/completion/` — **Member 4 Backend**
  * `modules/assignments/` — **Member 5 Backend**

---

## ⚡ Global State Management (Zustand)

Global UI and session state (like the currently logged-in user profile) are stored in Zustand stores instead of prop drilling.
* **Store Location**: `frontend/src/store/`
* **Conventions**:
  * All stores must be defined as hooks starting with `use` (e.g. `useAuthStore.js`).
  * Never state-mutate directly. Use actions defined inside the store to update properties.
  * Extract values selectively to prevent unnecessary component re-renders:
    ```javascript
    import useAuthStore from "@/store/useAuthStore"

    // Good: Only re-renders if the user object changes
    const user = useAuthStore((state) => state.user)
    ```

---

## 🔒 Authentication & API Calling Rules

* **JWT Cookies**: Authentication uses HTTP-only cookies (`token`) for session security. 
* **Axios Settings**: Credentials must always be sent. The axios instance is pre-configured with:
  ```javascript
  axios.defaults.withCredentials = true;
  ```
  Ensure all your custom fetchers use the default axios package to automatically inherit this configuration.
* **Path Aliases**: Use path aliases `@/` pointing directly to `src/` to avoid messy relative paths:
  ```javascript
  import { Button } from "@/components/ui/button" // Correct
  import { Button } from "../../components/ui/button" // Avoid
  ```

---

## 🗄️ Database Modification Policy (Prisma)

Since `prisma/schema.prisma` is a single shared file, modifying it requires care to prevent merge conflicts:

1. **Check Out Schema**: Before adding new tables or columns, pull the latest changes from the master branch.
2. **Add Tables with Prefix/Suffix**: To group models easily, name tables logically according to your module:
   * Member 1: `Course`, `Material`
   * Member 2: `Quiz`, `QuizAttempt`
   * Member 3: `Forum`, `Post`
   * Member 4: `CompletionRecord`
   * Member 5: `Assignment`, `Submission`
3. **Execute Non-Destructive Actions**: Run `npx prisma db push` during development to apply schema modifications without resetting other developers' test data. Avoid `prisma migrate dev` unless the group has collectively approved a migration freeze.
