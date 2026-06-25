import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { fork } from 'child_process';
import prisma from '../../config/db.js';

const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

let serverProcess;
let teacherToken;
let teacher2Token;
let studentToken;
let courseId;
let sectionId;
let quizId;
let attemptId;

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
  console.log('Starting quizzes test server...');

  // Start server process on test port
  serverProcess = fork('src/index.js', [], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    silent: true
  });

  // Wait for the health check endpoint to be online
  await waitForServer(`${BASE_URL}/health`);
  console.log('Test server is online.');

  // Clean up any old test users/courses in the database to start fresh
  const testEmailTeacher = 'test_teacher_api@uok.lk';
  const testEmailTeacher2 = 'test_teacher2_api@uok.lk';
  const testEmailStudent = 'test_student_api@uok.lk';

  const oldTeacher = await prisma.user.findUnique({ where: { email: testEmailTeacher } });
  if (oldTeacher) {
    // Delete any courses owned by this teacher to satisfy RESTRICT check
    await prisma.course.deleteMany({ where: { teacherId: oldTeacher.id } });
  }
  const oldTeacher2 = await prisma.user.findUnique({ where: { email: testEmailTeacher2 } });
  if (oldTeacher2) {
    await prisma.course.deleteMany({ where: { teacherId: oldTeacher2.id } });
  }

  await prisma.user.deleteMany({
    where: { email: { in: [testEmailTeacher, testEmailTeacher2, testEmailStudent] } }
  });

  // Register Teacher
  const regTeacherRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'API Test Teacher',
      email: testEmailTeacher,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const teacherData = await regTeacherRes.json();
  teacherToken = teacherData.token;

  // Register Teacher 2
  const regTeacher2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'API Test Teacher 2',
      email: testEmailTeacher2,
      password: 'password123',
      role: 'TEACHER'
    })
  });
  const teacher2Data = await regTeacher2Res.json();
  teacher2Token = teacher2Data.token;

  // Register Student
  const regStudentRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'API Test Student',
      email: testEmailStudent,
      password: 'password123',
      role: 'STUDENT'
    })
  });
  const studentData = await regStudentRes.json();
  studentToken = studentData.token;

  // Get or Create Course & Section for the test
  let course = await prisma.course.findFirst({
    where: { teacherId: teacherData.user.id }
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'API Course',
        description: 'Test course details',
        teacherId: teacherData.user.id
      }
    });
  }
  courseId = course.id;

  let section = await prisma.courseSection.findFirst({
    where: { courseId: course.id }
  });
  if (!section) {
    section = await prisma.courseSection.create({
      data: {
        title: 'API Section',
        courseId: course.id,
        sortOrder: 1
      }
    });
  }
  sectionId = section.id;
});

after(async () => {
  console.log('Stopping quizzes test server...');
  if (serverProcess) {
    serverProcess.kill();
  }

  // Clean up DB records
  if (quizId) {
    await prisma.quiz.deleteMany({ where: { id: quizId } });
    await prisma.material.deleteMany({ where: { itemId: quizId } });
  }
});

// --- API Endpoint Tests ---

test('POST /api/quizzes - Create Quiz (Teacher Success)', async () => {
  const questions = [
    {
      id: 'q1',
      type: 'multiple_choice',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      points: 10
    },
    {
      id: 'q2',
      type: 'true_false',
      questionText: 'The sky is blue.',
      options: ['True', 'False'],
      correctOption: 'True',
      points: 5
    }
  ];

  const res = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'API Test Quiz',
      hasTimeLimit: true,
      timeLimitMinutes: 10,
      minPassMark: 50,
      reviewPolicy: 'IMMEDIATE',
      questionsJson: questions
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.title, 'API Test Quiz');
  assert.strictEqual(data.timeLimitMinutes, 10);
  assert.strictEqual(data.minPassMark, 50);
  assert.strictEqual(data.reviewPolicy, 'IMMEDIATE');
  quizId = data.id;
});

test('POST /api/quizzes - Create Quiz Authorization check (Student Forbidden)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'Unauthorized Quiz',
      questionsJson: []
    })
  });

  assert.strictEqual(res.status, 403);
});

test('GET /api/quizzes/course/:courseId - Get course quizzes', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/course/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
  assert.strictEqual(data[0].id, quizId);
});

test('GET /api/quizzes/:id - Retrieve quiz as Student before attempt (Answers Stripped)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.questionsJson));

  // Verify correct answers are stripped out
  const firstQuestion = data.questionsJson[0];
  assert.strictEqual(firstQuestion.correctAnswer, undefined);
  assert.strictEqual(firstQuestion.correctOption, undefined);
});

test('POST /api/quizzes/:id/attempt - Start Attempt', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/${quizId}/attempt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.quizId, quizId);
  assert.strictEqual(data.submittedAt, null);
  attemptId = data.id;
});

test('PUT /api/quizzes/attempts/:attemptId/draft - Save Draft Answers', async () => {
  const draftAnswers = {
    q1: '4'
  };

  const res = await fetch(`${BASE_URL}/quizzes/attempts/${attemptId}/draft`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      submittedAnswersJson: draftAnswers
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.submittedAt, null);
  assert.deepStrictEqual(data.submittedAnswersJson, draftAnswers);
});

test('PUT /api/quizzes/attempts/:attemptId/submit - Submit Attempt & Grading', async () => {
  const answers = {
    q1: '4',       // Correct (10 points)
    q2: 'False'    // Incorrect (0 points)
  };
  // Total points: 15. Scored: 10. Percentage: 66.67%

  const res = await fetch(`${BASE_URL}/quizzes/attempts/${attemptId}/submit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      submittedAnswersJson: answers
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.submittedAt !== null);
  assert.strictEqual(data.score, 66.67);
});

test('GET /api/quizzes/:id - Retrieve quiz as Student after attempt (Answers Visible for IMMEDIATE)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.questionsJson));

  // Verify correct answers are now visible
  const firstQuestion = data.questionsJson[0];
  assert.strictEqual(firstQuestion.correctAnswer, '4');
});

test('GET /api/quizzes/attempts/:attemptId - Get single attempt info', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/attempts/${attemptId}`, {
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.id, attemptId);
  assert.strictEqual(data.score, 66.67);
});

test('PUT /api/quizzes/attempts/:attemptId/grade - Manual Grading & Feedback (Teacher)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/attempts/${attemptId}/grade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      score: 90.0,
      teacherFeedback: 'Well done on the math question, correct answer overrides!'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.score, 90);
  assert.strictEqual(data.teacherFeedback, 'Well done on the math question, correct answer overrides!');
});

// --- Test Case for reviewPolicy: NONE ---
test('reviewPolicy: NONE - Answers should remain hidden after submission', async () => {
  // 1. Create a quiz with NONE policy
  const createRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'No Review Quiz',
      reviewPolicy: 'NONE',
      questionsJson: [
        { id: 'nr1', type: 'multiple_choice', questionText: 'Choose A', options: ['A', 'B'], correctAnswer: 'A', points: 10 }
      ]
    })
  });
  const quizData = await createRes.json();
  const noneQuizId = quizData.id;

  // 2. Student starts attempt
  const attemptRes = await fetch(`${BASE_URL}/quizzes/${noneQuizId}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const attData = await attemptRes.json();

  // 3. Student submits attempt
  await fetch(`${BASE_URL}/quizzes/attempts/${attData.id}/submit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ submittedAnswersJson: { nr1: 'A' } })
  });

  // 4. Retrieve quiz as student - correct answer should still be stripped!
  const getQuizRes = await fetch(`${BASE_URL}/quizzes/${noneQuizId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const noneQuiz = await getQuizRes.json();
  assert.strictEqual(noneQuiz.questionsJson[0].correctAnswer, undefined);

  // Clean up
  await fetch(`${BASE_URL}/quizzes/${noneQuizId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
});

// --- Test Case for reviewPolicy: LATER ---
test('reviewPolicy: LATER - Answers hidden before time, visible after time', async () => {
  // 1. Create a quiz with LATER policy and future publish time (1 hour from now)
  const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const createRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'Later Review Quiz',
      reviewPolicy: 'LATER',
      reviewPublishTime: futureTime,
      questionsJson: [
        { id: 'lat1', type: 'multiple_choice', questionText: 'Choose A', options: ['A', 'B'], correctAnswer: 'A', points: 10 }
      ]
    })
  });
  const quizData = await createRes.json();
  const laterQuizId = quizData.id;

  // 2. Student starts attempt
  const attemptRes = await fetch(`${BASE_URL}/quizzes/${laterQuizId}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const attData = await attemptRes.json();

  // 3. Student submits attempt
  await fetch(`${BASE_URL}/quizzes/attempts/${attData.id}/submit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ submittedAnswersJson: { lat1: 'A' } })
  });

  // 4. Retrieve quiz as student - correct answer should still be stripped (since publish time is future)
  const getQuizRes1 = await fetch(`${BASE_URL}/quizzes/${laterQuizId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const quizPrePublish = await getQuizRes1.json();
  assert.strictEqual(quizPrePublish.questionsJson[0].correctAnswer, undefined);

  // 5. Update quiz publish time to the past (1 hour ago)
  const pastTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await fetch(`${BASE_URL}/quizzes/${laterQuizId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      reviewPublishTime: pastTime
    })
  });

  // 6. Retrieve quiz as student again - correct answer should now be visible!
  const getQuizRes2 = await fetch(`${BASE_URL}/quizzes/${laterQuizId}`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const quizPostPublish = await getQuizRes2.json();
  assert.strictEqual(quizPostPublish.questionsJson[0].correctAnswer, 'A');

  // Clean up
  await fetch(`${BASE_URL}/quizzes/${laterQuizId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
});

test('PUT /api/quizzes/:id - Update Quiz (Teacher)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      title: 'API Test Quiz - Revised'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.title, 'API Test Quiz - Revised');
});

test('Attempt Limit and Open/Close Schedule enforcement tests', async () => {
  // Create a Quiz with attemptLimit = 1
  const limitQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      sectionId,
      courseId,
      title: 'Limit Test Quiz',
      attemptLimit: 1,
      questionsJson: [
        { id: 'q1', type: 'true_false', questionText: 'Testing limits', options: ['True', 'False'], correctAnswer: 'True', points: 5 }
      ]
    })
  });
  assert.strictEqual(limitQuizRes.status, 201);
  const limitQuiz = await limitQuizRes.json();

  // Student Starts attempt 1 -> 201
  const start1Res = await fetch(`${BASE_URL}/quizzes/${limitQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(start1Res.status, 201);
  const start1 = await start1Res.json();

  // Submit attempt 1 -> 200
  const submit1Res = await fetch(`${BASE_URL}/quizzes/attempts/${start1.id}/submit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      submittedAnswersJson: { q1: 'True' }
    })
  });
  assert.strictEqual(submit1Res.status, 200);

  // Student tries to finalize attempt 1 of a single-attempt quiz -> 400 Bad Request
  const finalize1Res = await fetch(`${BASE_URL}/quizzes/attempts/${start1.id}/finalize`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(finalize1Res.status, 400);
  const finalize1Data = await finalize1Res.json();
  assert.ok(finalize1Data.error.includes('only applicable for quizzes with multiple attempts'));

  // Student tries to start attempt 2 -> 400 Bad Request (Limit reached)
  const start2Res = await fetch(`${BASE_URL}/quizzes/${limitQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(start2Res.status, 400);
  const start2Data = await start2Res.json();
  assert.ok(start2Data.error.includes('reached the maximum allowed attempts'));

  // Create a Quiz scheduled in the future (openTime = tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      sectionId,
      courseId,
      title: 'Future Quiz',
      openTime: tomorrow.toISOString(),
      questionsJson: [
        { id: 'q1', type: 'true_false', questionText: 'Future', options: ['True', 'False'], correctAnswer: 'True', points: 5 }
      ]
    })
  });
  assert.strictEqual(futureQuizRes.status, 201);
  const futureQuiz = await futureQuizRes.json();

  // Start attempt on future quiz -> 400
  const futureStartRes = await fetch(`${BASE_URL}/quizzes/${futureQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(futureStartRes.status, 400);
  const futureStartData = await futureStartRes.json();
  assert.ok(futureStartData.error.includes('not open yet'));

  // Create a Quiz closed in the past (closeTime = yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const pastQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      sectionId,
      courseId,
      title: 'Past Quiz',
      closeTime: yesterday.toISOString(),
      questionsJson: [
        { id: 'q1', type: 'true_false', questionText: 'Past', options: ['True', 'False'], correctAnswer: 'True', points: 5 }
      ]
    })
  });
  assert.strictEqual(pastQuizRes.status, 201);
  const pastQuiz = await pastQuizRes.json();

  // Start attempt on closed quiz -> 400
  const pastStartRes = await fetch(`${BASE_URL}/quizzes/${pastQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(pastStartRes.status, 400);
  const pastStartData = await pastStartRes.json();
  assert.ok(pastStartData.error.includes('is closed'));

  // Clean up test quizzes
  await prisma.quiz.deleteMany({
    where: { id: { in: [limitQuiz.id, futureQuiz.id, pastQuiz.id] } }
  });
});

test('Quiz Attempts Finalization and Review Unlock (Student)', async () => {
  // 1. Create a quiz with attemptLimit = 2, reviewPolicy = IMMEDIATE
  const testQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'Finalize Integration Test Quiz',
      hasTimeLimit: false,
      timeLimitMinutes: 0,
      minPassMark: 50,
      reviewPolicy: 'IMMEDIATE',
      attemptLimit: 2,
      questionsJson: [
        { id: 't1', type: 'true_false', questionText: 'Q1', options: ['True', 'False'], correctAnswer: 'True', points: 10 }
      ]
    })
  });
  assert.strictEqual(testQuizRes.status, 201);
  const testQuiz = await testQuizRes.json();

  // 2. Start attempt 1
  const startRes = await fetch(`${BASE_URL}/quizzes/${testQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(startRes.status, 201);
  const attempt1 = await startRes.json();

  // 3. Submit attempt 1
  const submitRes = await fetch(`${BASE_URL}/quizzes/attempts/${attempt1.id}/submit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      submittedAnswersJson: { t1: 'True' }
    })
  });
  assert.strictEqual(submitRes.status, 200);

  // 4. Retrieve attempt 1 -> answers should be stripped
  const getRes = await fetch(`${BASE_URL}/quizzes/attempts/${attempt1.id}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(getRes.status, 200);
  const getAttemptBefore = await getRes.json();
  const qBefore = getAttemptBefore.quiz.questionsJson[0];
  assert.strictEqual(qBefore.correctAnswer, undefined);

  // 5. Finalize attempt 1
  const finalizeRes = await fetch(`${BASE_URL}/quizzes/attempts/${attempt1.id}/finalize`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(finalizeRes.status, 200);
  const finalizedData = await finalizeRes.json();
  assert.strictEqual(finalizedData.isFinal, true);

  // 6. Retrieve attempt 1 again -> answers should be visible now!
  const getRes2 = await fetch(`${BASE_URL}/quizzes/attempts/${attempt1.id}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(getRes2.status, 200);
  const getAttemptAfter = await getRes2.json();
  const qAfter = getAttemptAfter.quiz.questionsJson[0];
  assert.strictEqual(qAfter.correctAnswer, 'True');

  // 7. Try starting attempt 2 -> should be blocked (400) because it was finalized
  const startRes2 = await fetch(`${BASE_URL}/quizzes/${testQuiz.id}/attempt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert.strictEqual(startRes2.status, 400);

  // Clean up
  await prisma.quiz.delete({ where: { id: testQuiz.id } });
});

test('Teacher isolation and access control tests for Quizzes, Modules, Materials, and Attempts', async () => {
  // 1. teacher2 tries to create a quiz for teacher1's course -> 403 Forbidden
  const createQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher2Token}`
    },
    body: JSON.stringify({
      courseId,
      sectionId,
      title: 'Teacher 2 Hijacked Quiz',
      questionsJson: []
    })
  });
  assert.strictEqual(createQuizRes.status, 403);
  const createQuizData = await createQuizRes.json();
  assert.ok(createQuizData.error.includes('Access denied. You do not own this course'));

  // 2. teacher2 tries to get quizzes for teacher1's course -> 403 Forbidden
  const getQuizzesRes = await fetch(`${BASE_URL}/quizzes/course/${courseId}`, {
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(getQuizzesRes.status, 403);

  // 3. teacher2 tries to get teacher1's single quiz -> 403 Forbidden
  const getQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(getQuizRes.status, 403);

  // 4. teacher2 tries to update teacher1's quiz -> 403 Forbidden
  const updateQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher2Token}`
    },
    body: JSON.stringify({ title: 'Hijacked Title' })
  });
  assert.strictEqual(updateQuizRes.status, 403);

  // 5. teacher2 tries to delete teacher1's quiz -> 403 Forbidden
  const deleteQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(deleteQuizRes.status, 403);

  // 6. teacher2 tries to create module section for teacher1's course -> 403 Forbidden
  const createModuleRes = await fetch(`${BASE_URL}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher2Token}`
    },
    body: JSON.stringify({ courseId, title: 'Hijacked Module', sortOrder: 5 })
  });
  assert.strictEqual(createModuleRes.status, 403);

  // 7. teacher2 tries to update teacher1's module section -> 403 Forbidden
  const updateModuleRes = await fetch(`${BASE_URL}/modules/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacher2Token}`
    },
    body: JSON.stringify({ title: 'Hijacked Module' })
  });
  assert.strictEqual(updateModuleRes.status, 403);

  // 8. teacher2 tries to delete teacher1's module section -> 403 Forbidden
  const deleteModuleRes = await fetch(`${BASE_URL}/modules/${sectionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${teacher2Token}` }
  });
  assert.strictEqual(deleteModuleRes.status, 403);
});

test('DELETE /api/quizzes/:id - Delete Quiz (Teacher)', async () => {
  const res = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${teacherToken}`
    }
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.message.includes('deleted'));
});
