const db = require('../config/database');

exports.getAllBoards = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM boards');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching boards' });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM boards WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the board' });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const result = await db.query(
      'INSERT INTO boards (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the board' });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      'UPDATE boards SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the board' });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM boards WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the board' });
  }
};

exports.getBoardTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT t.*, s.name as status, u.name as assigned_user
      FROM tasks t
      JOIN status s ON t.status_id = s.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.board_id = $1
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching board tasks' });
  }
};