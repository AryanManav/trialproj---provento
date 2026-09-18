import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/services/prisma.js';

describe('Code Master API Test Suite', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let projectAId = '';
  let fileAId = '';

  const userAData = {
    email: `usera_${Date.now()}@example.com`,
    password: 'password123',
    name: 'User A',
  };

  const userBData = {
    email: `userb_${Date.now()}@example.com`,
    password: 'password456',
    name: 'User B',
  };

  beforeAll(async () => {
    // Ensure DB connection
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test users
    try {
      if (userAId) {
        await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
      }
      if (userBId) {
        await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('Health Check', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication & Authorization', () => {
    it('registers user A successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userAData);

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userAData.email.toLowerCase());
      userAToken = res.body.token;
      userAId = res.body.user.id;
    });

    it('rejects duplicate email registration with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userAData);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('rejects registration with invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad-email', password: '123', name: '' });

      expect(res.status).toBe(400);
    });

    it('registers user B successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userBData);

      expect(res.status).toBe(201);
      userBToken = res.body.token;
      userBId = res.body.user.id;
    });

    it('logs in user A with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userAData.email, password: userAData.password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userAData.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('denies access to protected routes without token', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('fetches authenticated user details with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userAId);
    });
  });

  describe('Project Management (CRUD)', () => {
    it('creates a new project for User A', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Alpha Project', description: 'Testing workspace' });

      expect(res.status).toBe(201);
      expect(res.body.project.name).toBe('Alpha Project');
      expect(res.body.project.files.length).toBeGreaterThan(0);
      projectAId = res.body.project.id;
      fileAId = res.body.project.files[0].id;
    });

    it('lists projects for User A', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeInstanceOf(Array);
      expect(res.body.projects.some((p) => p.id === projectAId)).toBe(true);
    });

    it('renames project for User A', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'Alpha Project Renamed' });

      expect(res.status).toBe(200);
      expect(res.body.project.name).toBe('Alpha Project Renamed');
    });

    it('prevents User B from accessing User A project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('prevents User B from updating User A project', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(404);
    });
  });

  describe('File Management (CRUD)', () => {
    let newFileId = '';

    it('creates a file in User A project', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'test.js', content: 'console.log("test file");' });

      expect(res.status).toBe(201);
      expect(res.body.file.name).toBe('test.js');
      expect(res.body.file.language).toBe('javascript');
      newFileId = res.body.file.id;
    });

    it('prevents duplicate file names in the same project', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/files`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ name: 'test.js', content: 'duplicate' });

      expect(res.status).toBe(409);
    });

    it('updates file content (saving changes)', async () => {
      const updatedCode = 'console.log("Updated code content!");';
      const res = await request(app)
        .put(`/api/files/${newFileId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ content: updatedCode });

      expect(res.status).toBe(200);
      expect(res.body.file.content).toBe(updatedCode);
    });

    it('prevents User B from modifying User A file', async () => {
      const res = await request(app)
        .put(`/api/files/${newFileId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ content: 'User B trying to overwrite' });

      expect(res.status).toBe(404);
    });

    it('prevents User B from deleting User A file', async () => {
      const res = await request(app)
        .delete(`/api/files/${newFileId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('allows User A to delete file', async () => {
      const res = await request(app)
        .delete(`/api/files/${newFileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });

  describe('Code Execution Workflow', () => {
    it('executes valid JavaScript and returns stdout', async () => {
      const code = `
        const x = 10;
        const y = 20;
        console.log("Result:", x + y);
      `;
      const res = await request(app)
        .post('/api/execute')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ code, language: 'javascript' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.output).toContain('Result: 30');
      expect(res.body.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(res.body.error).toBeNull();
    });

    it('handles runtime error gracefully without crashing', async () => {
      const code = `
        const obj = null;
        obj.nonExistentMethod();
      `;
      const res = await request(app)
        .post('/api/execute')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ code });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('TypeError');
    });

    it('handles syntax error gracefully', async () => {
      const code = `
        function badSyntax( {
      `;
      const res = await request(app)
        .post('/api/execute')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ code });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('SyntaxError');
    });

    it('handles infinite loop with execution timeout', async () => {
      const code = `
        while(true) {}
      `;
      const res = await request(app)
        .post('/api/execute')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ code });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Execution Timeout');
    });

    it('rejects execution for unsupported languages', async () => {
      const res = await request(app)
        .post('/api/execute')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ code: '{"key": "val"}', language: 'json' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('not supported');
    });
  });
});
