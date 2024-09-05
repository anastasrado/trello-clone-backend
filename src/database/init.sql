-- Drop tables if they exist
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS status;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Create boards table
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Create status table
CREATE TABLE status (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status_id INTEGER REFERENCES status(id),
  assigned_user_id INTEGER REFERENCES users(id)
);

-- Insert default statuses
INSERT INTO status (name) VALUES ('Todo'), ('In Progress'), ('Done');

-- Insert a default user
INSERT INTO users (name) VALUES ('Default User');