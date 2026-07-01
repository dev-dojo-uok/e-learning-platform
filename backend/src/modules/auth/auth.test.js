import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { fork } from 'child_process';
import prisma from '../../config/db.js';

const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

let serverProcess;

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
  console.log('Starting auth test server...');
  
  // Start server process on test port
  serverProcess = fork('src/index.js', [], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    silent: true
  });

  // Wait for the health check endpoint to be online (assuming health check at root /api/health)
  await waitForServer(`http://localhost:${PORT}/api/health`);
  console.log('Auth test server is online.');

  // Clean up any user with emails starting with auth_test_
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'auth_test_'
      }
    }
  });
});

after(async () => {
  console.log('Stopping auth test server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  await new Promise(resolve => setTimeout(resolve, 500));
});

test('POST /register - Create Student Success', async () => {
  const email = 'auth_test_student@uok.lk';
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Auth Student',
      email,
      password: 'password123',
      role: 'STUDENT'
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.token);
  assert.strictEqual(data.user.email, email);
  assert.strictEqual(data.user.role, 'STUDENT');
  assert.strictEqual(data.user.password, undefined); // Ensure password is excluded
});

test('POST /register - Validation constraints (missing password)', async () => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'No Password User',
      email: 'auth_test_nopass@uok.lk'
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test('POST /register - Validation constraints (invalid role)', async () => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bad Role User',
      email: 'auth_test_badrole@uok.lk',
      password: 'password123',
      role: 'SUPERADMIN'
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test('POST /register - Duplicate email check', async () => {
  const email = 'auth_test_duplicate@uok.lk';
  
  // First registration
  await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'First User',
      email,
      password: 'password123',
      role: 'STUDENT'
    })
  });

  // Second registration with duplicate email
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Second User',
      email,
      password: 'password123',
      role: 'STUDENT'
    })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test('POST /login - Success login', async () => {
  const email = 'auth_test_login@uok.lk';
  const password = 'password123';

  // Pre-register user
  await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Login User',
      email,
      password,
      role: 'TEACHER'
    })
  });

  // Try to login
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.strictEqual(data.user.email, email);
  assert.strictEqual(data.user.role, 'TEACHER');
});

test('POST /login - Invalid credentials (wrong password)', async () => {
  const email = 'auth_test_login_wrong@uok.lk';
  const password = 'password123';

  // Pre-register user
  await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Login User',
      email,
      password,
      role: 'TEACHER'
    })
  });

  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrongpassword' })
  });

  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.ok(data.error);
});

test('GET /whoami - Retrieve profiles with authorization', async () => {
  const email = 'auth_test_whoami@uok.lk';
  const password = 'password123';

  const regRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Whoami User',
      email,
      password,
      role: 'TEACHER'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;

  // Retrieve without token -> 401
  const resNoToken = await fetch(`${BASE_URL}/whoami`);
  assert.strictEqual(resNoToken.status, 401);

  // Retrieve with invalid token -> 403
  const resBadToken = await fetch(`${BASE_URL}/whoami`, {
    headers: { 'Authorization': 'Bearer invalidtokenhere' }
  });
  assert.strictEqual(resBadToken.status, 403);

  // Retrieve with valid token -> 200
  const resSuccess = await fetch(`${BASE_URL}/whoami`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(resSuccess.status, 200);
  const successData = await resSuccess.json();
  assert.strictEqual(successData.user.email, email);
  assert.strictEqual(successData.user.role, 'TEACHER');
});

test('POST /logout - Clear cookie logout', async () => {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: 'POST'
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.message, 'Logged out successfully.');
});
