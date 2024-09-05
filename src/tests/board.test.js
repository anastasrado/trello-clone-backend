const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('Board API', () => {
  let boardId, userId;

  beforeAll(async () => {
    // Clean up any existing data
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM boards');
    await db.query('DELETE FROM users WHERE name = $1', ['Test User']);

    // Create a test user
    const userResult = await db.query("INSERT INTO users (name) VALUES ('Test User') RETURNING id");
    userId = userResult.rows[0].id;
  });

  beforeEach(async () => {
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM boards');

    const result = await db.query(`
      INSERT INTO boards (name, description) VALUES ('Test Board', 'Test Description') RETURNING id
    `);
    boardId = result.rows[0].id;

    await db.query(`
      INSERT INTO tasks (board_id, title, description, status_id, assigned_user_id) 
      VALUES ($1, 'Test Task', 'Test Description', 1, $2)
    `, [boardId, userId]);
  });

  afterAll(async () => {
    // Clean up all data
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM boards');
    await db.query('DELETE FROM users WHERE name = $1', ['Test User']);
  });

  it('should get all boards', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('name', 'Test Board');
  });

  it('should get a specific board', async () => {
    const res = await request(app).get(`/api/boards/${boardId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', boardId);
    expect(res.body).toHaveProperty('name', 'Test Board');
  });

  it('should create a new board', async () => {
    const newBoard = {
      name: 'New Board',
      description: 'New Description'
    };

    const res = await request(app)
      .post('/api/boards')
      .send(newBoard);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'New Board');
  });

  it('should update an existing board', async () => {
    const updatedBoard = {
      name: 'Updated Board',
      description: 'Updated Description'
    };

    const res = await request(app)
      .put(`/api/boards/${boardId}`)
      .send(updatedBoard);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', boardId);
    expect(res.body).toHaveProperty('name', 'Updated Board');
  });

  it('should delete an existing board', async () => {
    const res = await request(app).delete(`/api/boards/${boardId}`);
    expect(res.statusCode).toBe(204);

    const checkRes = await request(app).get(`/api/boards/${boardId}`);
    expect(checkRes.statusCode).toBe(404);
  });

  it('should get all tasks for a specific board', async () => {
    const res = await request(app).get(`/api/boards/${boardId}/tasks`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('title', 'Test Task');
  });
});