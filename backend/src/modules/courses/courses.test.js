import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { fork } from 'child_process';
import prisma from '../../config/db.js';

const PORT = 5004;
const BASE_URL = `http://localhost:${PORT}/api`;

let serverProcess;
let teacher1Token;
let teacher2Token;
let studentToken;
let teacher1Id;
let courseId;

// Helper to wait for the server to be ready
async function waitForServer(url, retries = 10, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // Ignored: wait and try again
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('Server did not start in time');
}

before(async () => {
  console.log('Starting courses test server...');
  
  // Start server process on test port
  serverProcess = fork('src/index.js', [], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    silent: true
  });

  // Wait for health check
  await waitForServer(`${BASE_URL}/health`);
  console.log('Courses test server is online.');

  // Clean up any old test users/courses in the database to start fresh
  const emailT1 = 'course_test_teacher1@uok.lk';
  const emailT2 = 'course_test_teacher2@uok.lk';
  const emailS = 'course_test_student@uok.lk';

  // Find existing users to delete their courses first (to avoid RESTRICT failures)
  const users = await prisma.user.findMany({
    where: { email: { in: [emailT1, emailT2, emailS] } }
  });

  if (users.length > 0) {
    const userIds = users.map(u => u.id);
    await prisma.course.deleteMany({
      where: { teacherId: { in: userIds } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
  }

  // Register Teacher 1
  const t1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Course Test Teacher 1',
      email: emailT1,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const t1Data = await t1Res.json();
  teacher1Token = t1Data.token;
  teacher1Id = t1Data.user.id;

  // Register Teacher 2
  const t2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Course Test Teacher 2',
      email: emailT2,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const t2Data = await t2Res.json();
  teacher2Token = t2Data.token;

  // Register Student
  const sRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Course Test Student',
      email: emailS,
      password: 'password123',
      role: 'STUDENT'
    })
  });
  const sData = await sRes.json();
  studentToken = sData.token;
});

after(async () => {
  console.log('Stopping courses test server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  await new Promise(resolve => setTimeout(resolve, 500));
});

test('POST /api/courses - Create course (Teacher Success)', async () => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher1Token}`
    },
    body: JSON.stringify({
      title: 'Introduction to Node Testing',
      description: 'Learn integration testing in Node.js',
      teacherId: teacher1Id
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.id);
  assert.strictEqual(data.title, 'Introduction to Node Testing');
  courseId = data.id;
});

test('POST /api/courses - Validation error (missing title)', async () => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher1Token}`
    },
    body: JSON.stringify({
      description: 'Missing title description',
      teacherId: teacher1Id
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.errors);
});

test('POST /api/courses - Forbidden for Student role', async () => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      title: 'Hacker Course',
      description: 'Hacking the system',
      teacherId: teacher1Id
    })
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.error, 'Unauthorized role permissions.');
});

test('GET /api/courses - Get all courses (Student)', async () => {
  const res = await fetch(`${BASE_URL}/courses`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const testCourse = data.find(c => c.id === courseId);
  assert.ok(testCourse);
  assert.strictEqual(testCourse.title, 'Introduction to Node Testing');
});

test('GET /api/courses - Get courses as Teacher (Filtered to owned only)', async () => {
  const res = await fetch(`${BASE_URL}/courses`, {
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const testCourse = data.find(c => c.id === courseId);
  assert.strictEqual(testCourse, undefined); // teacher2 should NOT see teacher1's course
});

test('GET /api/courses/:id - Get course by ID (Student)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.id, courseId);
  assert.strictEqual(data.title, 'Introduction to Node Testing');
});

test('GET /api/courses/:id - Get course by ID (Teacher Non-Owner Forbidden)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.ok(data.error.includes('Access denied. You do not own this course'));
});

test('PUT /api/courses/:id - Update course (Teacher Owner Success)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher1Token}`
    },
    body: JSON.stringify({
      title: 'Advanced Node Testing Techniques',
      description: 'Learn integration testing in depth'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.title, 'Advanced Node Testing Techniques');
});

test('PUT /api/courses/:id - Update course (Teacher Non-Owner Forbidden)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher2Token}`
    },
    body: JSON.stringify({
      title: 'Hijacked Course Name'
    })
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.ok(data.error.includes('Access denied. You do not own this course'));
});

test('DELETE /api/courses/:id - Delete course (Student Forbidden)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.error, 'Unauthorized role permissions.');
});

test('DELETE /api/courses/:id - Delete course (Teacher Owner Success)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${teacher1Token}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.message, 'Course deleted successfully.');

  // Verify deletion
  const getRes = await fetch(`${BASE_URL}/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(getRes.status, 404);
});
