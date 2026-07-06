import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { fork } from 'child_process';
import prisma from '../../config/db.js';

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

let serverProcess;
let studentToken;
let studentId;
let studentToken2;
let studentId2;
let teacherToken;
let teacherId;
let teacherToken2;
let teacherId2;
let courseId;
let enrollmentId;

// Helper to wait for the server to be ready
async function waitForServer(url, retries = 10, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      console.log(`[waitForServer] Attempt ${i + 1} failed: ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('Server did not start in time');
}

before(async () => {
  console.log('Starting enrollments test server...');
  
  // Start server process on test port
  serverProcess = fork('src/index.js', [], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    silent: false
  });

  if (serverProcess.stdout) {
    serverProcess.stdout.on('data', (data) => {
      console.log(`[SERVER OUT] ${data.toString().trim()}`);
    });
  }

  if (serverProcess.stderr) {
    serverProcess.stderr.on('data', (data) => {
      console.log(`[SERVER ERR] ${data.toString().trim()}`);
    });
  }

  serverProcess.on('exit', (code, signal) => {
    console.log(`[SERVER EXIT] child process exited with code ${code} and signal ${signal}`);
  });

  // Wait for health check (with 30 retries / 15 seconds max wait time)
  await waitForServer(`${BASE_URL}/health`, 30);
  console.log('Enrollments test server is online.');

  // Clean up existing test data
  const emailT = 'enroll_test_teacher@uok.lk';
  const emailS = 'enroll_test_student@uok.lk';
  const emailT2 = 'enroll_test_teacher2@uok.lk';
  const emailS2 = 'enroll_test_student2@uok.lk';

  const users = await prisma.user.findMany({
    where: { email: { in: [emailT, emailS, emailT2, emailS2] } }
  });

  if (users.length > 0) {
    const userIds = users.map(u => u.id);
    await prisma.enrollment.deleteMany({
      where: { studentId: { in: userIds } }
    });
    await prisma.course.deleteMany({
      where: { teacherId: { in: userIds } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
  }

  // Register Student via auth endpoint to get token
  const sRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Enroll Test Student',
      email: emailS,
      password: 'password123',
      role: 'STUDENT'
    })
  });
  const sData = await sRes.json();
  studentToken = sData.token;
  studentId = sData.user.id;

  // Register Student 2
  const s2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Enroll Test Student 2',
      email: emailS2,
      password: 'password123',
      role: 'STUDENT'
    })
  });
  const s2Data = await s2Res.json();
  studentToken2 = s2Data.token;
  studentId2 = s2Data.user.id;

  // Register Teacher via auth endpoint to get token
  const tRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Enroll Test Teacher',
      email: emailT,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const tData = await tRes.json();
  teacherToken = tData.token;
  teacherId = tData.user.id;

  // Register Teacher 2
  const t2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Enroll Test Teacher 2',
      email: emailT2,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const t2Data = await t2Res.json();
  teacherToken2 = t2Data.token;
  teacherId2 = t2Data.user.id;

  // Create Course (Teacher account token needed)
  const cRes = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'Enrollment Test Course',
      description: 'Test course for enrollment',
      teacherId
    })
  });
  const cData = await cRes.json();
  courseId = cData.id;
});

after(async () => {
  console.log('Stopping enrollments test server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  await new Promise(resolve => setTimeout(resolve, 500));

  // Final database clean up
  if (studentId) {
    await prisma.enrollment.deleteMany({
      where: { studentId: { in: [studentId, studentId2] } }
    });
    await prisma.course.deleteMany({
      where: { title: 'Enrollment Test Course' }
    });
    await prisma.user.deleteMany({
      where: { email: { in: [
        'enroll_test_teacher@uok.lk',
        'enroll_test_student@uok.lk',
        'enroll_test_teacher2@uok.lk',
        'enroll_test_student2@uok.lk'
      ] } }
    });
  }
});

test('Test 1: Enroll Student Successfully', async () => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId,
      courseId
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.message, 'Student enrolled successfully');
  assert.ok(data.enrollment);
  assert.ok(data.enrollment.id);
  assert.strictEqual(data.enrollment.studentId, studentId);
  assert.strictEqual(data.enrollment.courseId, courseId);
  enrollmentId = data.enrollment.id;
});

test('Test 2: Duplicate Enrollment', async () => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId,
      courseId
    })
  });

  assert.strictEqual(res.status, 409);
  const data = await res.json();
  assert.strictEqual(data.message, 'Student is already enrolled in this course.');
});

test('Test 3: Invalid Student ID', async () => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId: 'wrong-id',
      courseId
    })
  });

  assert.strictEqual(res.status, 404);
  const data = await res.json();
  assert.strictEqual(data.message, 'Student not found.');
});

test('Test 4: Invalid Course ID', async () => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId,
      courseId: 'wrong-id'
    })
  });

  assert.strictEqual(res.status, 404);
  const data = await res.json();
  assert.strictEqual(data.message, 'Course not found.');
});

test('Test 5: Get Student Enrolled Courses', async () => {
  const res = await fetch(`${BASE_URL}/students/${studentId}/courses`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const hasEnrollment = data.some(e => e.id === enrollmentId);
  assert.ok(hasEnrollment);
});

test('Test 6: Get Course Enrolled Students', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/students`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${teacherToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const hasStudent = data.some(e => e.student.id === studentId);
  assert.ok(hasStudent);
});

test('Test 7: Remove Enrollment', async () => {
  const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.message, 'Enrollment removed successfully.');
});

test('Test 8: Student Cannot Enroll Another Student (403)', async () => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken2}`
    },
    body: JSON.stringify({
      studentId: studentId, // Student 2 trying to enroll Student 1
      courseId
    })
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.message, 'Access denied. Students can only enroll themselves.');
});

test('Test 9: Student Cannot View Other Students Enrollments (403)', async () => {
  const res = await fetch(`${BASE_URL}/students/${studentId}/courses`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${studentToken2}` // Student 2 trying to view Student 1's courses
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.message, 'Access denied. You can only view your own enrolled courses.');
});

test('Test 10: Student Cannot Remove Other Students Enrollments (403)', async () => {
  // Create an enrollment first to try and delete (Student 1 enrolling back in Course)
  const enrollRes = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      studentId,
      courseId
    })
  });
  const enrollData = await enrollRes.json();
  const tempEnrollId = enrollData.enrollment.id;

  const res = await fetch(`${BASE_URL}/enrollments/${tempEnrollId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${studentToken2}` // Student 2 trying to remove Student 1's enrollment
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.message, 'Access denied. You can only remove your own enrollment.');

  // Clean up: delete Student 1's enrollment
  await fetch(`${BASE_URL}/enrollments/${tempEnrollId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });
});

test('Test 11: Teacher Cannot Remove Enrollments from Unowned Course (403)', async () => {
  // Create an enrollment first (Student 2 enrolling in Course)
  const enrollRes = await fetch(`${BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken2}`
    },
    body: JSON.stringify({
      studentId: studentId2,
      courseId
    })
  });
  const enrollData = await enrollRes.json();
  const tempEnrollmentId = enrollData.enrollment.id;

  const res = await fetch(`${BASE_URL}/enrollments/${tempEnrollmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${teacherToken2}` // Teacher 2 trying to delete enrollment from Course (owned by Teacher 1)
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.message, 'Access denied. You do not own this course.');

  // Clean up the temp enrollment as Student 2
  await fetch(`${BASE_URL}/enrollments/${tempEnrollmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${studentToken2}`
    }
  });
});

test('Test 12: Student Cannot View Course Enrolled Students (403)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/students`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.error, 'Unauthorized role permissions.');
});

test('Test 13: Teacher Cannot View Enrolled Students from Unowned Course (403)', async () => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/students`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${teacherToken2}`
    }
  });

  assert.strictEqual(res.status, 403);
  const data = await res.json();
  assert.strictEqual(data.error, 'Access denied. You do not own this course.');
});
