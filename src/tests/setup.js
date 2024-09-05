const db = require('../config/database');

beforeAll(async () => {
  // Set up test database
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS status (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      status_id INTEGER REFERENCES status(id),
      assigned_user_id INTEGER REFERENCES users(id)
    )
  `);
  await db.query(`INSERT INTO status (name) VALUES ('Todo'), ('In Progress'), ('Done')`);
  await db.query(`INSERT INTO users (name) VALUES ('Test User')`);
});

afterAll(async () => {
  // Clean up test database
  await db.query('DROP TABLE IF EXISTS tasks');
  await db.query('DROP TABLE IF EXISTS boards');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('DROP TABLE IF EXISTS status');
});