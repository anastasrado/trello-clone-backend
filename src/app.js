const express = require('express');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());

app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

module.exports = app;