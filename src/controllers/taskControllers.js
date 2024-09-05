const db = require('../config/database');

exports.getAllTasks = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, b.name as board_name, s.name as status, u.name as assigned_user
      FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN status s ON t.status_id = s.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT t.*, b.name as board_name, s.name as status, u.name as assigned_user
      FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN status s ON t.status_id = s.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { board_id, title, description, status_id, assigned_user_id } = req.body;

    if (!board_id || !title || !status_id) {
      return res.status(400).json({ error: 'Board ID, title, and status_id are required' });
    }

    const result = await db.query(
      'INSERT INTO tasks (board_id, title, description, status_id, assigned_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [board_id, title, description, status_id, assigned_user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status_id, assigned_user_id } = req.body;

    const result = await db.query(
      'UPDATE tasks SET title = $1, description = $2, status_id = $3, assigned_user_id = $4 WHERE id = $5 RETURNING *',
      [title, description, status_id, assigned_user_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the task' });
  }
};