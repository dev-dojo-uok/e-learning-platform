# E-Learning Platform API Documentation

This document provides comprehensive API documentation for the Course Management, Module Management, and Material Management modules of the E-Learning Platform backend. It is designed to support project demonstrations, technical documentations, system design reports, and future frontend integrations.

---

## 🔒 Authentication & Authorization Requirements

JWT-based authentication and role-based access control (RBAC) are implemented across all modifying endpoints:

*   **Authentication Mechanisms**: Supported via **HttpOnly Cookies** (using field name `token`) or via the **Authorization Header** (using scheme `Bearer <token>`).
*   **Roles & Permissions**:
    *   `STUDENT`: Read-only access to published courses, modules, and materials.
    *   `TEACHER` and `ADMIN`: Read-write access to courses, modules, and materials, including operations to create, update, delete, and upload files.
*   **Public Endpoints**: Retrieve (`GET`) endpoints for courses, modules, and materials do not require authentication.

---

## 🗑️ Cascade Delete Behavior

The database relations are governed by Prisma schemas with relational integrity constraints:

### 1. Course Deletion (Cascade)
Deleting a course automatically triggers the deletion of all course sections (modules) belonging to it.
*   **Prisma Rule**: `sections CourseSection[] @relation("CourseSections")` maps to `course Course @relation("CourseSections", fields: [courseId], references: [id], onDelete: Cascade)` in the `CourseSection` model.

### 2. Module Deletion (Cascade)
Deleting a module (section) automatically triggers the deletion of all materials (documents, files, videos) linked to it.
*   **Prisma Rule**: `materials Material[] @relation("SectionMaterials")` maps to `section CourseSection @relation("SectionMaterials", fields: [sectionId], references: [id], onDelete: Cascade)` in the `Material` model.

### 3. File Cleanup on Material Deletion
The backend service (`MaterialService`) listens to material deletion and update operations. Whenever a material representing a local file is deleted or updated with a new file, the old file is automatically unlinked and permanently deleted from disk storage to prevent server bloat.

---

## 📁 File Upload Specifications

*   **Storage Folder**: `backend/uploads/materials/`
*   **File Storage Mechanism**: Stored directly on the local filesystem and managed via Multer storage middleware.
*   **File Naming Convention**: Standardized using a unique random UUID to avoid naming collisions (e.g., `550e8400-e29b-41d4-a716-446655440000.pdf`).
*   **Size Limit**: Maximum file size allowed is **20 MB** (20,971,520 bytes).
*   **Supported Formats & Mapping**:
    *   `PDF` (`.pdf`) -> stored internally with type `PDF`
    *   `DOCUMENT` (`.doc`, `.docx`) -> stored internally with type `FILE`
    *   `IMAGE` (`.jpg`, `.jpeg`, `.png`, `.webp`) -> stored internally with type `FILE`
    *   `ZIP` (`.zip`) -> stored internally with type `FILE`

---

## 📚 Course Management APIs

### 1. Create Course

*   **HTTP Method**: `POST`
*   **Endpoint URL**: `/api/courses`
*   **Purpose/Description**: Creates a new course in the system.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Parameters
None.

#### Request Body
##### JSON Structure
```json
{
  "title": "Introduction to Software Architecture",
  "description": "An introductory course to design patterns, architectural styles, and principles.",
  "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8"
}
```

##### Field Descriptions & Validation Rules
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | Yes | The title of the course. | Must be a string, max 255 characters, non-empty. |
| `description` | String | No | Detailed description of the course content. | Must be a string if provided. |
| `teacherId` | String | Yes | ID of the teacher authoring the course. | Must be a valid UUID. |

#### Successful Response
*   **Status Code**: `201 Created`
##### Response Body
```json
{
  "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Introduction to Software Architecture",
  "description": "An introductory course to design patterns, architectural styles, and principles.",
  "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8",
  "createdAt": "2026-06-19T13:00:00.000Z",
  "updatedAt": "2026-06-19T13:00:00.000Z"
}
```

#### Error Responses
*   **400 Bad Request** (Validation Failed)
    ```json
    {
      "errors": [
        {
          "type": "field",
          "value": "",
          "msg": "Title is required",
          "path": "title",
          "location": "body"
        }
      ]
    }
    ```
*   **401 Unauthorized** (Missing Token)
    ```json
    {
      "error": "Access denied. No token provided."
    }
    ```
*   **403 Forbidden** (Invalid Role Permissions)
    ```json
    {
      "error": "Unauthorized role permissions."
    }
    ```
*   **500 Internal Server Error**
    ```json
    {
      "error": "Internal server error during course creation."
    }
    ```

---

### 2. Get All Courses

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/courses`
*   **Purpose/Description**: Retrieves a list of all courses registered in the database.

#### Request Headers
None required.

#### Request Parameters
None.

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
[
  {
    "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
    "title": "Introduction to Software Architecture",
    "description": "An introductory course to design patterns, architectural styles, and principles.",
    "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8",
    "createdAt": "2026-06-19T13:00:00.000Z",
    "updatedAt": "2026-06-19T13:00:00.000Z"
  }
]
```

#### Error Responses
*   **500 Internal Server Error**
    ```json
    {
      "error": "Internal server error fetching courses."
    }
    ```

---

### 3. Get Course By ID

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/courses/:id`
*   **Purpose/Description**: Fetches detailed information about a course by its unique ID.

#### Request Headers
None required.

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Course ID.

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Introduction to Software Architecture",
  "description": "An introductory course to design patterns, architectural styles, and principles.",
  "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8",
  "createdAt": "2026-06-19T13:00:00.000Z",
  "updatedAt": "2026-06-19T13:00:00.000Z"
}
```

#### Error Responses
*   **400 Bad Request** (Invalid UUID Format)
    ```json
    {
      "errors": [
        {
          "type": "field",
          "value": "invalid-id",
          "msg": "Course ID must be a valid UUID",
          "path": "id",
          "location": "params"
        }
      ]
    }
    ```
*   **404 Not Found** (Course not found)
    ```json
    {
      "error": "Course not found."
    }
    ```
*   **500 Internal Server Error**
    ```json
    {
      "error": "Internal server error fetching course."
    }
    ```

---

### 4. Update Course

*   **HTTP Method**: `PUT`
*   **Endpoint URL**: `/api/courses/:id`
*   **Purpose/Description**: Updates fields of an existing course.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Course ID (UUID format).

#### Request Body
##### JSON Structure
```json
{
  "title": "Advanced Software Architecture",
  "description": "Deep dive into microservices, serverless, and clean architecture paradigms."
}
```

##### Field Descriptions & Validation Rules
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | No | The updated title. | Must be a string, max 255 characters, non-empty if provided. |
| `description` | String | No | The updated description. | Must be a string if provided. |

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Advanced Software Architecture",
  "description": "Deep dive into microservices, serverless, and clean architecture paradigms.",
  "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8",
  "createdAt": "2026-06-19T13:00:00.000Z",
  "updatedAt": "2026-06-19T13:10:00.000Z"
}
```

#### Error Responses
*   **400 Bad Request** (Invalid parameters or missing fields)
*   **401 Unauthorized** (Missing auth token)
*   **403 Forbidden** (Unauthorized role permissions)
*   **404 Not Found** (Course does not exist)
    ```json
    {
      "error": "Course not found."
    }
    ```
*   **500 Internal Server Error**

---

### 5. Delete Course

*   **HTTP Method**: `DELETE`
*   **Endpoint URL**: `/api/courses/:id`
*   **Purpose/Description**: Deletes a course. Cascade-deletes all child modules and materials.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Course ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "message": "Course deleted successfully."
}
```

#### Error Responses
*   **400 / 401 / 403 / 404 / 500** standard responses apply.

---

## 📦 Module Management APIs

### 1. Create Module

*   **HTTP Method**: `POST`
*   **Endpoint URL**: `/api/modules`
*   **Purpose/Description**: Creates a new course module under a parent course.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Parameters
None.

#### Request Body
##### JSON Structure
```json
{
  "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Module 1: Architectural Patterns",
  "sortOrder": 1
}
```

##### Field Descriptions & Validation Rules
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `courseId` | String | Yes | Parent course UUID. | Must be a valid UUID. |
| `title` | String | Yes | Title of the module. | Must be a string, max 255 characters, non-empty. |
| `sortOrder` | Integer | Yes | The ordering order of this module. | Must be a non-negative integer. |

#### Successful Response
*   **Status Code**: `201 Created`
##### Response Body
```json
{
  "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Module 1: Architectural Patterns",
  "sortOrder": 1,
  "createdAt": "2026-06-19T13:05:00.000Z",
  "updatedAt": "2026-06-19T13:05:00.000Z",
  "course": {
    "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
    "title": "Advanced Software Architecture",
    "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8"
  }
}
```

#### Error Responses
*   **404 Not Found** (If the parent course ID doesn't match an existing course)
    ```json
    {
      "error": "Course with the specified ID does not exist."
    }
    ```
*   **400 Bad Request** (Validation failures)

---

### 2. Get Modules By Course

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/modules/course/:courseId`
*   **Purpose/Description**: Retrieves all modules belonging to a specific course, sorted by `sortOrder` ascending.

#### Request Headers
None required.

#### Request Parameters
##### Path Parameters
*   `courseId` (String, Required) -> The Parent Course ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
[
  {
    "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
    "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
    "title": "Module 1: Architectural Patterns",
    "sortOrder": 1,
    "createdAt": "2026-06-19T13:05:00.000Z",
    "updatedAt": "2026-06-19T13:05:00.000Z"
  }
]
```

#### Error Responses
*   **404 Not Found** (Course does not exist)
    ```json
    {
      "error": "Course with the specified ID does not exist."
    }
    ```

---

### 3. Get Module By ID

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/modules/:id`
*   **Purpose/Description**: Retrieves a single module by its unique ID.
*   **Implementation Status**: ⚠️ *Not Currently Implemented*. Currently, modules are fetched hierarchically in groups per course via `GET /api/modules/course/:courseId` to optimize client data bindings. Requests to `/api/modules/:id` will trigger a routing error.

---

### 4. Update Module

*   **HTTP Method**: `PUT`
*   **Endpoint URL**: `/api/modules/:id`
*   **Purpose/Description**: Modifies the details (title, order) of a module.

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Module ID (UUID format).

#### Request Body
##### JSON Structure
```json
{
  "title": "Module 1: Architectural Patterns (Revised)",
  "sortOrder": 0
}
```

##### Field Descriptions & Validation Rules
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | No | New module title. | Must be a string, max 255 characters, non-empty if provided. |
| `sortOrder` | Integer | No | New sort order. | Must be a non-negative integer. |

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
  "title": "Module 1: Architectural Patterns (Revised)",
  "sortOrder": 0,
  "createdAt": "2026-06-19T13:05:00.000Z",
  "updatedAt": "2026-06-19T13:15:00.000Z",
  "course": {
    "id": "7b0a7019-3ff2-4a0b-96fa-6979606d713c",
    "title": "Advanced Software Architecture",
    "teacherId": "35e3962e-9d29-4d6d-8a6c-ec9a5be351b8"
  }
}
```

#### Error Responses
*   **400 Bad Request** (At least one updatable field must be provided)
    ```json
    {
      "error": "At least one field (title or sortOrder) must be provided."
    }
    ```
*   **404 Not Found** (Module doesn't exist)
    ```json
    {
      "error": "Course module not found."
    }
    ```

---

### 5. Delete Module

*   **HTTP Method**: `DELETE`
*   **Endpoint URL**: `/api/modules/:id`
*   **Purpose/Description**: Deletes a module. Cascade-deletes all materials under the module.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Module ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "message": "Course module deleted successfully."
}
```

#### Error Responses
*   **404 Not Found**
    ```json
    {
      "error": "Course module not found."
    }
    ```

---

## 📄 Material Management APIs

### 1. Upload Material / Create Material

*   **HTTP Method**: `POST`
*   **Endpoint URL**: `/api/materials`
*   **Purpose/Description**: Creates a new material. Supports both standard JSON payloads and multipart/form-data for file uploads.

#### Request Headers
```http
Content-Type: multipart/form-data
Authorization: Bearer <token>
```
*Note: If uploading `YOUTUBE` or `VIDEO` without a physical file, `Content-Type: application/json` is also supported.*

#### Request Parameters
None.

#### Request Body (multipart/form-data)
##### Field Descriptions & Validation Rules
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `sectionId` | String | Yes | ID of the parent module (UUID format). | Must be a valid UUID. |
| `title` | String | Yes | Title of the material. | Must be a string, max 255 characters, non-empty. |
| `description` | String | No | Description of the material. | Optional. |
| `type` | String | Yes | Material type. | Must be: `PDF`, `VIDEO`, `YOUTUBE`, `DOCUMENT`, `IMAGE`, `ZIP`. |
| `contentUrl` | String | Optional | External content URL. | Required if `type` is `VIDEO`. Must be a valid URL. |
| `embedCode` | String | Optional | HTML embed code or YouTube link. | Required if `type` is `YOUTUBE`. |
| `isGraded` | Boolean | No | Indicates if the material is graded. | Defaults to `false`. |
| `gradingWeight`| Float | No | Grade weight (0.0 to 100.0). | Defaults to `0.0`. |
| `file` | File Binary| Type-dependent| The uploaded file. | Required if `type` is `PDF`, `DOCUMENT`, `IMAGE`, or `ZIP`. Field name must be `file`. Max 20 MB. |

#### Successful Response
*   **Status Code**: `201 Created`
##### Response Body (Example for PDF Upload)
```json
{
  "id": "4f8a321a-e99d-40ab-867c-d6b38c29013c",
  "sectionId": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "title": "Clean Architecture PDF",
  "description": "Reading material for Week 1.",
  "type": "PDF",
  "contentUrl": "uploads/materials/a6fcd834-8c88-422f-ad3d-b4b92b678cfa.pdf",
  "embedCode": null,
  "itemId": null,
  "isGraded": false,
  "gradingWeight": 0,
  "createdAt": "2026-06-19T13:20:00.000Z",
  "updatedAt": "2026-06-19T13:20:00.000Z",
  "section": {
    "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
    "title": "Module 1: Architectural Patterns (Revised)",
    "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c"
  }
}
```

##### Response Body (Example for YOUTUBE JSON upload)
```json
{
  "id": "4f8a321a-e99d-40ab-867c-d6b38c29013e",
  "sectionId": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "title": "Introduction to Patterns",
  "description": "Watch this overview video.",
  "type": "VIDEO_EMBED",
  "contentUrl": null,
  "embedCode": "<iframe src='https://youtube.com/...'></iframe>",
  "isGraded": false,
  "gradingWeight": 0,
  "createdAt": "2026-06-19T13:22:00.000Z",
  "updatedAt": "2026-06-19T13:22:00.000Z",
  "section": {
    "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
    "title": "Module 1: Architectural Patterns (Revised)",
    "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c"
  }
}
```

#### Error Responses
*   **400 Bad Request** (Missing File for PDF)
    ```json
    {
      "error": "A file upload is required for material type \"PDF\"."
    }
    ```
*   **400 Bad Request** (Invalid File Extension)
    ```json
    {
      "errors": [
        {
          "msg": "Invalid file type. Allowed extensions: .pdf, .doc, .docx, .jpg, .jpeg, .png, .webp, .zip"
        }
      ]
    }
    ```
*   **400 Bad Request** (File Size Limit Exceeded)
    ```json
    {
      "errors": [
        {
          "msg": "File size exceeds the 20 MB limit."
        }
      ]
    }
    ```
*   **404 Not Found** (Section doesn't exist)
    ```json
    {
      "error": "Course section (module) with the specified ID does not exist."
    }
    ```

---

### 2. Get Materials By Module

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/materials/module/:moduleId`
*   **Purpose/Description**: Gets all materials belonging to a module.
*   **Route Path**: `/api/materials/module/:sectionId` (Note: `sectionId` maps to the module's primary key `id`).

#### Request Headers
None required.

#### Request Parameters
##### Path Parameters
*   `sectionId` (String, Required) -> The Module ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
[
  {
    "id": "4f8a321a-e99d-40ab-867c-d6b38c29013c",
    "sectionId": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
    "title": "Clean Architecture PDF",
    "description": "Reading material for Week 1.",
    "type": "PDF",
    "contentUrl": "uploads/materials/a6fcd834-8c88-422f-ad3d-b4b92b678cfa.pdf",
    "embedCode": null,
    "itemId": null,
    "isGraded": false,
    "gradingWeight": 0,
    "createdAt": "2026-06-19T13:20:00.000Z",
    "updatedAt": "2026-06-19T13:20:00.000Z"
  }
]
```

#### Error Responses
*   **404 Not Found** (Module not found)
    ```json
    {
      "error": "Course section (module) with the specified ID does not exist."
    }
    ```

---

### 3. Get Material By ID

*   **HTTP Method**: `GET`
*   **Endpoint URL**: `/api/materials/:id`
*   **Purpose/Description**: Retrieves a single material.

#### Request Headers
None required.

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Material ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "id": "4f8a321a-e99d-40ab-867c-d6b38c29013c",
  "sectionId": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "title": "Clean Architecture PDF",
  "description": "Reading material for Week 1.",
  "type": "PDF",
  "contentUrl": "uploads/materials/a6fcd834-8c88-422f-ad3d-b4b92b678cfa.pdf",
  "embedCode": null,
  "itemId": null,
  "isGraded": false,
  "gradingWeight": 0,
  "createdAt": "2026-06-19T13:20:00.000Z",
  "updatedAt": "2026-06-19T13:20:00.000Z",
  "section": {
    "id": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
    "title": "Module 1: Architectural Patterns (Revised)",
    "courseId": "7b0a7019-3ff2-4a0b-96fa-6979606d713c"
  }
}
```

#### Error Responses
*   **404 Not Found**
    ```json
    {
      "error": "Material not found."
    }
    ```

---

### 4. Update Material

*   **HTTP Method**: `PUT`
*   **Endpoint URL**: `/api/materials/:id`
*   **Purpose/Description**: Modifies properties of a material. Optionally replaces files.

#### Request Headers
```http
Content-Type: multipart/form-data
Authorization: Bearer <token>
```
*Note: If only updating text fields (JSON structure), `Content-Type: application/json` is also supported.*

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Material ID (UUID format).

#### Request Body
##### Fields (All Optional)
*   `title` (String, Optional) -> New title.
*   `description` (String, Optional) -> New description.
*   `isGraded` (Boolean, Optional) -> Update graded status.
*   `gradingWeight` (Float, Optional) -> Update grading weight.
*   `file` (File, Optional) -> If provided, the existing file on disk is deleted and replaced with the new one.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "id": "4f8a321a-e99d-40ab-867c-d6b38c29013c",
  "sectionId": "6a9e1022-3ff3-4a0c-96fb-6979606d714d",
  "title": "Clean Architecture PDF (Revised Version)",
  "description": "Reading material for Week 1.",
  "type": "PDF",
  "contentUrl": "uploads/materials/b5dde834-8c88-422f-ad3d-b4b92b678cfb.pdf",
  "embedCode": null,
  "itemId": null,
  "isGraded": false,
  "gradingWeight": 0,
  "createdAt": "2026-06-19T13:20:00.000Z",
  "updatedAt": "2026-06-19T13:30:00.000Z"
}
```

#### Error Responses
*   **400 Bad Request** / **404 Not Found** / **401 Unauthorized** / **403 Forbidden**

---

### 5. Delete Material

*   **HTTP Method**: `DELETE`
*   **Endpoint URL**: `/api/materials/:id`
*   **Purpose/Description**: Deletes the material record and unlinks its physical file from disk storage.

#### Request Headers
```http
Authorization: Bearer <token>
```

#### Request Parameters
##### Path Parameters
*   `id` (String, Required) -> The Material ID (UUID format).

#### Request Body
None.

#### Successful Response
*   **Status Code**: `200 OK`
##### Response Body
```json
{
  "message": "Material deleted successfully."
}
```

#### Error Responses
*   **404 Not Found**
    ```json
    {
      "error": "Material not found."
    }
    ```

---

## 🛠️ API Testing Guide

Verify backend functions using Postman or cURL:

### Step 1: User Auth (Login/Register)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Teacher Account",
  "email": "teacher@elearning.test",
  "password": "Password123",
  "role": "TEACHER"
}
```
*Note: Copy the `token` from response and set it in your Postman collection Authorization headers as a Bearer Token.*

### Step 2: Create a Course
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Engineering",
  "description": "Deep-level backend systems design",
  "teacherId": "<your_user_id>"
}
```
*Note: Copy `id` of the course created (referred below as `<COURSE_ID>`).*

### Step 3: Create a Module under the Course
```http
POST /api/modules
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "<COURSE_ID>",
  "title": "Module 1: Intro",
  "sortOrder": 1
}
```
*Note: Copy `id` of the module created (referred below as `<MODULE_ID>`).*

### Step 4: Upload Material under the Module
Configure the request body as `form-data`:
*   `sectionId`: `<MODULE_ID>`
*   `title`: `Course Guide`
*   `type`: `PDF`
*   `file`: Select a `.pdf` file.

```http
POST /api/materials
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
*Note: Copy `id` of the material created (referred below as `<MATERIAL_ID>`).*

### Step 5: Retrieve Data Hierarchically
Verify retrieval:
```http
GET /api/modules/course/<COURSE_ID>
GET /api/materials/module/<MODULE_ID>
```

### Step 6: Update Data (PUT)
Verify text update or file replacement:
```http
PUT /api/materials/<MATERIAL_ID>
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Course Guide (Updated Title)"
}
```

### Step 7: Verify Cascade Deletes
Delete the course:
```http
DELETE /api/courses/<COURSE_ID>
Authorization: Bearer <token>
```
Verify cascade:
*   Fetch modules by course: `GET /api/modules/course/<COURSE_ID>` -> returns `404 Not Found` or empty `[]`.
*   Fetch materials by module: `GET /api/materials/module/<MODULE_ID>` -> returns `404 Not Found` or empty `[]`.
*   Verify that any uploaded files in `uploads/materials/` have been removed from the filesystem.

---

## 📊 API Summary Table

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Registers a new user and generates a session JWT. | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticates a user and returns a session JWT. | No |
| **Auth** | `POST` | `/api/auth/logout` | Clears authentication cookies. | No |
| **Auth** | `GET` | `/api/auth/whoami` | Retrieves the currently authenticated user session details. | Yes |
| **Course** | `POST` | `/api/courses` | Creates a new course. | Yes (`TEACHER`/`ADMIN`) |
| **Course** | `GET` | `/api/courses` | Retrieves all courses. | No |
| **Course** | `GET` | `/api/courses/:id` | Retrieves a course by its ID. | No |
| **Course** | `PUT` | `/api/courses/:id` | Updates a course's fields. | Yes (`TEACHER`/`ADMIN`) |
| **Course** | `DELETE`| `/api/courses/:id` | Deletes a course (cascade-deletes modules and materials). | Yes (`TEACHER`/`ADMIN`) |
| **Module** | `POST` | `/api/modules` | Creates a module under a course. | Yes (`TEACHER`/`ADMIN`) |
| **Module** | `GET` | `/api/modules/course/:courseId` | Retrieves modules belonging to a course, sorted. | No |
| **Module** | `GET` | `/api/modules/:id` | Retrieves a module by its ID (*Bypassed in implementation*). | No |
| **Module** | `PUT` | `/api/modules/:id` | Updates a module's details. | Yes (`TEACHER`/`ADMIN`) |
| **Module** | `DELETE`| `/api/modules/:id` | Deletes a module (cascade-deletes materials). | Yes (`TEACHER`/`ADMIN`) |
| **Material**| `POST` | `/api/materials` | Creates/uploads a material under a module. | Yes (`TEACHER`/`ADMIN`) |
| **Material**| `GET` | `/api/materials/module/:sectionId`| Retrieves materials belonging to a module. | No |
| **Material**| `GET` | `/api/materials/:id` | Retrieves a single material. | No |
| **Material**| `PUT` | `/api/materials/:id` | Updates a material's text/file content. | Yes (`TEACHER`/`ADMIN`) |
| **Material**| `DELETE`| `/api/materials/:id` | Deletes a material (and unlinks file from disk). | Yes (`TEACHER`/`ADMIN`) |
