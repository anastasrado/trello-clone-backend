const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('Task API', () => {
  let boardId, taskId, userId;

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

    const boardResult = await db.query(`
      INSERT INTO boards (name, description) VALUES ('Test Board', 'Test Description') RETURNING id
    `);
    boardId = boardResult.rows[0].id;

    const taskResult = await db.query(`
      INSERT INTO tasks (board_id, title, description, status_id, assigned_user_id) 
      VALUES ($1, 'Test Task', 'Test Description', 1, $2) RETURNING id
    `, [boardId, userId]);
    taskId = taskResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up all data
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM boards');
    await db.query('DELETE FROM users WHERE name = $1', ['Test User']);
  });

  it('should get all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('title', 'Test Task');
  });

  it('should get a specific task', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', taskId);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('board_name', 'Test Board');
  });

  it('should create a new task', async () => {
    const newTask = {
      board_id: boardId,
      title: 'New Task',
      description: 'New Description',
      status_id: 1,
      assigned_user_id: userId
    };

    const res = await request(app)
      .post('/api/tasks')
      .send(newTask);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'New Task');
    expect(res.body).toHaveProperty('board_id', boardId);
  });

  it('should update an existing task', async () => {
    const updatedTask = {
      board_id: boardId,
      title: 'Updated Task',
      description: 'Updated Description',
      status_id: 2,
      assigned_user_id: userId
    };

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send(updatedTask);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', taskId);
    expect(res.body).toHaveProperty('title', 'Updated Task');
    expect(res.body).toHaveProperty('status_id', 2);
  });

  it('should delete an existing task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`);
    expect(res.statusCode).toBe(204);

    const checkRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(checkRes.statusCode).toBe(404);
  });

  it('should return 400 for creating a task without required fields', async () => {
    const invalidTask = { title: 'Invalid Task' };

    const res = await request(app)
      .post('/api/tasks')
      .send(invalidTask);

    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for updating non-existent task', async () => {
    const res = await request(app)
      .put('/api/tasks/9999')
      .send({ title: 'Updated Task' });

    expect(res.statusCode).toBe(404);
  });

  it('should return 404 for deleting non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });
});